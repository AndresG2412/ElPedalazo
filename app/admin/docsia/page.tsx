'use client';

import { useState, useRef } from 'react';
import Container from '@/app/components/Container';
import { 
  ArrowLeft, 
  Upload, 
  Key, 
  Settings, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

// Import Firebase services
import { getAllMarcas, createMarca } from '@/firebase/marcas';
import { getAllCategories, createCategory } from '@/firebase/categories';
import { createProduct } from '@/firebase/products';

export default function DocsIAPage() {
  // Configuration State
  const [apiKey, setApiKey] = useState('AIzaSyBK8JprNtWkIJ7Q2m16qrHzvOR9C44AXfY');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [rpmLimit, setRpmLimit] = useState(15);
  const [useAI, setUseAI] = useState(true);
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  /**
   * Parser CSV robusto con state machine.
   * Maneja correctamente campos entre comillas que contienen el delimitador
   * (ej: imágenes base64 con "data:image/jpeg;base64,...").
   * La regex de lookahead falla con strings muy largos (>50KB por campo).
   */
  const parseCSV = (text: string): any[] => {
    // ── Detectar delimitador en la primera línea ──
    const firstNewline = text.indexOf('\n');
    const firstLine = firstNewline >= 0 ? text.slice(0, firstNewline) : text;
    const delimiter = firstLine.includes(';') ? ';' : ',';

    // ── Parser de una fila: state machine carácter a carácter ──
    const parseRow = (line: string): string[] => {
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"') {
            // comilla doble escapada ""
            if (i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === delimiter) {
            fields.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
      }
      fields.push(current.trim());
      return fields;
    };

    // ── Dividir en líneas (respetando posibles \r\n) ──
    const rawLines = text.split(/\r?\n/);
    if (rawLines.length < 2) return [];

    const headers = parseRow(rawLines[0]);
    const data: any[] = [];

    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line.trim()) continue;
      const values = parseRow(line);
      const obj: any = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] !== undefined ? values[idx] : '';
      });
      data.push(obj);
    }
    return data;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      Swal.fire({
        title: 'Formato inválido',
        text: 'Por favor, sube un archivo .csv válido.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      setParsedData(data);
      addLog(`Archivo cargado: ${selectedFile.name} (${data.length} filas detectadas).`);
    };
    reader.readAsText(selectedFile);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const callGemini = async (prompt: string, retries = 3): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Error en la API de Gemini';
        
        // Handle Rate Limit Error specifically
        if (response.status === 429 || errorMessage.includes('Quota exceeded')) {
           const retryMatch = errorMessage.match(/Please retry in (\d+(?:\.\d+)?)s/);
           if (retryMatch && retryMatch[1] && retries > 0) {
             const waitTimeSeconds = parseFloat(retryMatch[1]);
             addLog(`Límite de API excedido. Esperando ${Math.ceil(waitTimeSeconds)}s antes de reintentar...`);
             await sleep((waitTimeSeconds + 1) * 1000); // Wait the requested time + 1s buffer
             return callGemini(prompt, retries - 1);
           } else if (retries > 0) {
             // Fallback wait time if parsing fails
             addLog(`Límite de API excedido. Esperando 30s antes de reintentar...`);
             await sleep(30000);
             return callGemini(prompt, retries - 1);
           }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
       // If it's a network error and we have retries
       if (retries > 0 && !error.message.includes('Quota exceeded')) {
         addLog(`Error de red. Reintentando en 5s...`);
         await sleep(5000);
         return callGemini(prompt, retries - 1);
       }
       throw error;
    }
  };

  const processMarcas = async (data: any[]) => {
    setCurrentStep(1);
    addLog('Iniciando sincronización de Marcas...');
    
    const uniqueMarcasCSV = Array.from(new Set(data.map(item => item.marca).filter(Boolean)));
    addLog(`Marcas únicas encontradas en el CSV: ${uniqueMarcasCSV.length}`);

    const existingMarcasDB = await getAllMarcas();
    const existingMarcaNames = existingMarcasDB.map(m => m.name.toLowerCase());

    const missingMarcas = uniqueMarcasCSV.filter(m => !existingMarcaNames.includes(m.toLowerCase()));
    
    if (missingMarcas.length === 0) {
      addLog('Todas las marcas ya existen en la base de datos.');
      return;
    }

    addLog(`Creando ${missingMarcas.length} marcas nuevas...`);
    setProgress({ current: 0, total: missingMarcas.length });

    let count = 0;
    for (const marcaName of missingMarcas) {
      await createMarca({ name: marcaName });
      count++;
      setProgress({ current: count, total: missingMarcas.length });
      addLog(`Marca creada: ${marcaName}`);
    }
  };

  const processCategorias = async (data: any[]) => {
    setCurrentStep(2);
    addLog('Iniciando sincronización de Categorías...');
    
    // Asumiendo que el csv tiene columnas "categoria" o "categoria_id". 
    // Usaremos "categoria" que es más legible, si está vacía usaremos el ID.
    const uniqueCategoriasCSV = Array.from(new Set(
      data.map(item => item.categoria || item.categoria_id).filter(Boolean)
    ));
    addLog(`Categorías únicas encontradas en el CSV: ${uniqueCategoriasCSV.length}`);

    const existingCategoriasDB = await getAllCategories();
    const existingCategoryNames = existingCategoriasDB.map(c => c.name.toLowerCase());

    const missingCategorias = uniqueCategoriasCSV.filter(c => !existingCategoryNames.includes(c.toLowerCase()));
    
    if (missingCategorias.length === 0) {
      addLog('Todas las categorías ya existen en la base de datos.');
      return;
    }

    addLog(`Creando ${missingCategorias.length} categorías nuevas...`);
    setProgress({ current: 0, total: missingCategorias.length });

    let count = 0;
    for (const catName of missingCategorias) {
      // Creamos la categoría sin descripción inicialmente
      await createCategory({ name: catName, description: 'Categoría importada automáticamente.' });
      count++;
      setProgress({ current: count, total: missingCategorias.length });
      addLog(`Categoría creada: ${catName}`);
    }
  };

  /**
   * Convierte un data URI base64 a Blob binario.
   * Cloudinary falla con "Could not decode base64" cuando se envía
   * el data URI como string en FormData — necesita un File/Blob real.
   */
  const dataURItoBlob = (dataURI: string): Blob => {
    const parts = dataURI.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  };

  const uploadImageToCloudinary = async (fileOrUrl: string): Promise<string> => {
    const formData = new FormData();

    if (fileOrUrl.startsWith('data:')) {
      // Convertir data URI → Blob binario para evitar "Could not decode base64"
      const blob = dataURItoBlob(fileOrUrl);
      // Detectar extensión del MIME type (ej: image/webp -> webp)
      const ext = blob.type.split('/')[1] || 'jpg';
      formData.append('file', blob, `product.${ext}`);
    } else {
      // URL http/https: Cloudinary la descarga directamente
      formData.append('file', fileOrUrl);
    }

    formData.append('upload_preset', 'El Pedalazo');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/duwosb0hu/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir imagen');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error(`No se pudo subir la imagen`);
    }
  };

  const processProducts = async (data: any[]) => {
    setCurrentStep(3);
    addLog('Iniciando procesamiento de Productos con IA...');
    setProgress({ current: 0, total: data.length });
    
    const delayMs = (60 / rpmLimit) * 1000;
    addLog(`Configurado retraso de ${delayMs}ms entre peticiones a Gemini.`);

    // Obtener IDs reales para categoría y marca
    const allCategorias = await getAllCategories();
    const allMarcas = await getAllMarcas();

    let count = 0;
    for (const item of data) {
      if (!item.nombre) {
        addLog(`Fila ignorada (sin nombre).`);
        continue;
      }

      const marcaName = item.marca || '';
      const catName = item.categoria || item.categoria_id || '';
      const rawPrice = item.precio_num || item.precio || '0';
      const cleanPrice = Number(String(rawPrice).replace(/[^0-9.-]+/g,"")); // Limpia caracteres como $ o .

      // Buscar IDs reales en DB
      const dbCategory = allCategorias.find(c => c.name.toLowerCase() === catName.toLowerCase());
      const dbMarca = allMarcas.find(m => m.name.toLowerCase() === marcaName.toLowerCase());

      let description = '';
      
      if (useAI) {
        const prompt = `Genera una descripción atractiva y profesional para este producto de ciclismo. Solo devuelve el texto de la descripción, sin formato Markdown, sin títulos ni saludos iniciales.
Producto: ${item.nombre}
Marca: ${marcaName}
Categoría: ${catName}
Precio: ${cleanPrice}`;

        try {
          addLog(`Consultando Gemini para: ${item.nombre}...`);
          description = await callGemini(prompt);
        } catch (error: any) {
          addLog(`Error con Gemini en ${item.nombre}: ${error.message}`);
          description = `${item.nombre} de la marca ${marcaName}. Excelente opción en la categoría de ${catName}.`;
        }
      } else {
        description = `${item.nombre} de la marca ${marcaName}. Excelente opción en la categoría de ${catName}.`;
      }

      // Crear producto en Firebase
      try {
        let imageUrl = 'https://via.placeholder.com/500?text=Sin+Imagen';
        // Acepta data:image/ (que incluye webp) o URLs http
        if (item.imagen && (item.imagen.startsWith('data:image/') || item.imagen.startsWith('http'))) {
          try {
            addLog(`Subiendo imagen de ${item.nombre} a Cloudinary...`);
            imageUrl = await uploadImageToCloudinary(item.imagen);
          } catch (error: any) {
            addLog(`Error subiendo imagen de ${item.nombre}: ${error.message}`);
          }
        }

        const result = await createProduct({
          title: item.nombre,
          price: cleanPrice || 0,
          stock: 1,
          description: description,
          category: dbCategory ? dbCategory.id : catName, // Fallback al nombre si no se encuentra el ID
          marca: dbMarca ? dbMarca.id : marcaName,
          images: [imageUrl]
        });

        if (result.success) {
          addLog(`Producto guardado: ${item.nombre}`);
        } else {
          addLog(`Error al guardar producto ${item.nombre}: ${result.error?.message}`);
        }
      } catch (error: any) {
        addLog(`Error fatal al guardar ${item.nombre}: ${error.message}`);
      }

      count++;
      setProgress({ current: count, total: data.length });
      
      if (useAI && count < data.length) {
        addLog(`Esperando ${delayMs/1000}s para respetar límite RPM...`);
        await sleep(delayMs);
      } else if (!useAI && count < data.length) {
        // Un pequeño retraso para no saturar Firebase y Cloudinary (300ms)
        await sleep(300);
      }
    }
  };

  const startProcess = async () => {
    if (!apiKey) {
      Swal.fire('API Key Requerida', 'Por favor ingresa tu API Key de Gemini.', 'warning');
      return;
    }
    if (parsedData.length === 0) {
      Swal.fire('Archivo Requerido', 'Por favor sube un archivo CSV válido.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Iniciar proceso automático?',
      text: `Se procesarán ${parsedData.length} filas. Esto puede tomar un tiempo.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar',
      background: '#0a0a0a',
      color: '#fff',
      confirmButtonColor: '#F59E0B'
    });

    if (!confirm.isConfirmed) return;

    setIsProcessing(true);
    setLogs([]);
    
    try {
      await processMarcas(parsedData);
      await processCategorias(parsedData);
      await processProducts(parsedData);
      
      setCurrentStep(4);
      addLog('¡Proceso finalizado con éxito!');
      
      Swal.fire({
        title: 'Completado',
        text: 'La importación de datos y la generación de IA ha finalizado.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#F59E0B'
      });
    } catch (error: any) {
      console.error(error);
      addLog(`ERROR FATAL: ${error.message}`);
      Swal.fire('Error', 'Ocurrió un error inesperado durante el proceso.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-pedal-bgMain pt-24 pb-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="text-white w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-syne font-bold text-3xl text-white flex items-center gap-3">
                <FileText className="text-pedal-primary-glow" />
                DocsIA - Subida Inteligente
              </h1>
              <p className="text-white/50 text-sm mt-1">Automatiza la creación de productos usando Gemini IA</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuración */}
            <div className="bg-pedal-bgSurface p-6 rounded-4xl border border-white/5 h-fit space-y-6">
              <h2 className="text-xl font-bold text-white font-syne flex items-center gap-2 border-b border-white/5 pb-4">
                <Settings className="text-pedal-primary-glow w-5 h-5" /> Configuración
              </h2>

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" /> Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-pedal-primary-glow focus:ring-1 focus:ring-pedal-primary-glow transition-all"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-2">Modelo IA</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pedal-primary-glow focus:ring-1 focus:ring-pedal-primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!useAI || isProcessing}
                  >
                    <option value="gemini-2.5-flash" className="bg-pedal-bgSurface">Gemini 2.5 Flash (Rápido)</option>
                    <option value="gemini-2.5-pro" className="bg-pedal-bgSurface">Gemini 2.5 Pro (Calidad)</option>
                    <option value="gemini-1.5-pro" className="bg-pedal-bgSurface">Gemini 1.5 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-2">Límite RPM</label>
                  <input
                    type="number"
                    value={rpmLimit}
                    onChange={(e) => setRpmLimit(Number(e.target.value))}
                    min="1"
                    max="60"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pedal-primary-glow focus:ring-1 focus:ring-pedal-primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!useAI || isProcessing}
                  />
                  <p className="text-white/30 text-xs mt-1">Peticiones por minuto</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-black/50 text-pedal-primary-glow focus:ring-pedal-primary-glow focus:ring-offset-0 cursor-pointer"
                  disabled={isProcessing}
                />
                <label htmlFor="useAI" className="text-white font-semibold cursor-pointer select-none">
                  Generar descripción profesional con Gemini IA
                </label>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2">Archivo CSV</label>
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    file ? 'border-pedal-primary-glow bg-pedal-primary-glow/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-pedal-primary-glow' : 'text-white/30'}`} />
                  {file ? (
                    <p className="text-white font-semibold">{file.name}</p>
                  ) : (
                    <p className="text-white/50 text-sm">Clic para seleccionar un archivo .csv</p>
                  )}
                </div>
              </div>

              <button
                onClick={startProcess}
                disabled={isProcessing || !file || !apiKey}
                className="w-full py-4 rounded-xl bg-linear-to-r from-pedal-primary-glow to-amber-600 text-black font-syne font-bold transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin w-5 h-5" /> Procesando...</>
                ) : (
                  <><Play className="w-5 h-5" /> Iniciar Subida Inteligente</>
                )}
              </button>
            </div>

            {/* Progreso y Logs */}
            <div className="bg-pedal-bgSurface p-6 rounded-4xl border border-white/5 flex flex-col h-[600px]">
              <h2 className="text-xl font-bold text-white font-syne flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                Estado del Proceso
              </h2>

              {/* Indicadores de Paso */}
              <div className="space-y-4 mb-6">
                {[
                  { step: 1, label: 'Sincronizar Marcas' },
                  { step: 2, label: 'Sincronizar Categorías' },
                  { step: 3, label: 'Generar e Importar Productos' },
                ].map((s) => (
                  <div key={s.step} className={`flex items-center gap-3 ${currentStep >= s.step ? 'text-white' : 'text-white/30'}`}>
                    {currentStep > s.step || currentStep === 4 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : currentStep === s.step ? (
                      <Loader2 className="w-5 h-5 text-pedal-primary-glow animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-current" />
                    )}
                    <span className="font-syne font-semibold">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Barra de Progreso */}
              {isProcessing && progress.total > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-white/50 mb-2">
                    <span>Progreso del paso actual</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pedal-primary-glow transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Consola de Logs */}
              <div className="flex-1 bg-black/50 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-xs text-white/70 flex flex-col gap-1">
                {logs.length === 0 ? (
                  <div className="text-white/30 text-center my-auto flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8" />
                    <p>Esperando para iniciar...</p>
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
