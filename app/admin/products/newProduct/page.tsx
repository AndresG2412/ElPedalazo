'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  DollarSign, 
  FileText, 
  Upload, 
  X,
  Sparkles,
  Tag,
  Loader2,
  Package
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllCategories, Category } from '@/firebase/categories';
import { createProduct, ProductData } from '@/firebase/products'; 
import Link from 'next/link';

// Configuración de Cloudinary (pon tus credenciales aquí)
const CLOUDINARY_CONFIG = {
  cloudName: 'duwosb0hu',
  uploadPreset: 'El Pedalazo',
  maxFileSize: 10 * 1024 * 1024,
  maxFiles: 5
};

export default function NewProduct() {
  const [formData, setFormData] = useState({
    price: '',
    stock: '',
    description: '',
    title: '',
    category: '',
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        setErrorCategories('');
      } catch (error: any) {
        console.error('Error loading categories:', error);
        setErrorCategories(error.message || 'Error al cargar las categorías');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Función para mostrar alertas con SweetAlert2
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    Swal.fire({
      title,
      text: message,
      icon: type,
      background: '#000000',
      color: '#ffffff',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Entendido',
      timer: type === 'success' ? 2000 : undefined,
      showConfirmButton: true,
      customClass: {
        popup: 'rounded-2xl',
        title: 'font-syne text-xl',
        confirmButton: 'font-syne rounded-lg px-6 py-2'
      }
    });
  };

  // Subir imágenes a Cloudinary una por una automáticamente
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
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
      throw new Error(`No se pudo subir ${file.name}`);
    }
  };

  // Subir imágenes automáticamente cuando se seleccionan
  const uploadImagesAutomatically = async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    let hasError = false;
    
    for (const file of files) {
      try {
        // Inicializar progreso para este archivo
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simular progreso (Cloudinary no proporciona progreso fácilmente)
        // Puedes implementar un progreso real si usas XMLHttpRequest
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }));
        }, 100);
        
        const url = await uploadImageToCloudinary(file);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        uploadedUrls.push(url);
        setImageUrls(prev => [...prev, url]);
      } catch (error: any) {
        console.error('Error:', error);
        hasError = true;
        showAlert('Error al subir imagen', `No se pudo subir ${file.name}`, 'error');
        // Remover el archivo que falló
        setImageFiles(prev => prev.filter(f => f.name !== file.name));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
    
    setUploadingImages(false);
    
    // Limpiar progresos después de un momento
    setTimeout(() => {
      setUploadProgress({});
    }, 2000);
    
    if (!hasError && uploadedUrls.length > 0) {
      showAlert('¡Imágenes subidas!', `${uploadedUrls.length} imagen(es) subida(s) correctamente`, 'success');
    } else if (uploadedUrls.length > 0) {
      showAlert('Subida parcial', `Se subieron ${uploadedUrls.length} de ${files.length} imágenes`, 'warning');
    }
  };

  // Manejar selección/arrastre de imágenes
  const handleImageUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    const remainingSlots = CLOUDINARY_CONFIG.maxFiles - imageFiles.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    const validImages = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) {
        showAlert('Formato no válido', `${file.name} no es una imagen`, 'warning');
        return false;
      }
      if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
        showAlert('Archivo muy grande', `${file.name} excede los 10MB`, 'warning');
        return false;
      }
      return true;
    });
    
    if (validImages.length === 0) return;
    
    // Agregar archivos temporalmente para preview
    setImageFiles(prev => [...prev, ...validImages].slice(0, CLOUDINARY_CONFIG.maxFiles));
    
    // Subir automáticamente a Cloudinary
    await uploadImagesAutomatically(validImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && !uploadingImages) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = imageFiles[indexToRemove];
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[imageToRemove.name];
      return newProgress;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.title.trim()) {
      showAlert('Campo requerido', 'El título es obligatorio', 'warning');
      return;
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      showAlert('Campo requerido', 'El precio debe ser mayor a 0', 'warning');
      return;
    }
    
    if (!formData.stock || Number(formData.stock) < 0) {
      showAlert('Campo requerido', 'El stock debe ser un número válido (0 o más)', 'warning');
      return;
    }
    
    if (!formData.category) {
      showAlert('Campo requerido', 'Selecciona una categoría', 'warning');
      return;
    }
    
    if (imageUrls.length === 0) {
      showAlert('Imágenes requeridas', 'Sube al menos una imagen antes de publicar', 'warning');
      return;
    }
    
    if (uploadingImages) {
      showAlert('Espera un momento', 'Las imágenes aún se están subiendo', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos para Firebase
      const productData: ProductData = {
        title: formData.title.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description.trim(),
        category: formData.category,
        images: imageUrls
      };
      
      // Guardar en Firebase
      const result = await createProduct(productData);
      
      if (result.success) {
        showAlert('¡Producto creado!', 'El producto se ha publicado exitosamente', 'success');
        // Limpiar formulario
        setFormData({ price: '', stock: '', description: '', title: '', category: '' });
        setImageFiles([]);
        setImageUrls([]);
        setUploadProgress({});
      } else {
        showAlert('Error', result.error?.message || 'No se pudo crear el producto', 'error');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      showAlert('Error inesperado', error.message || 'Ocurrió un error al crear el producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determinar si el botón de publicar debe estar habilitado
  const isPublishDisabled = () => {
    return isSubmitting || uploadingImages || imageUrls.length === 0;
  };

  return (
    <div className="min-h-screen bg-pedal-bgMain pt-16 flex items-center justify-center md:block md:pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold font-syne tracking-tight text-white mb-3">
            Crear Producto
          </h1>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="animate-fade-up animation-delay-200 bg-pedal-bgSurface/50 backdrop-blur-sm rounded-[2rem] border border-pedal-primary-glow/10 p-6 md:p-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 ">
            {/* Sección de Imagenes */}
            <div className="space-y-4 ">
              <label className="block text-white/70 font-syne text-sm font-semibold mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                Imágenes del Producto (Máx. 5)
              </label>
              
              <div
                onClick={() => !uploadingImages && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative rounded-[2rem] bg-pedal-bgSurface border-2 border-dashed
                  transition-all duration-300 cursor-pointer
                  ${uploadingImages ? 'opacity-70 cursor-wait' : ''}
                  ${isDragging 
                    ? 'border-pedal-primary-glow bg-pedal-primary-glow/5 scale-[1.01]' 
                    : 'border-white/10 hover:border-pedal-primary-glow/30'
                  }
                  ${imageFiles.length > 0 ? 'p-4' : 'p-8'}
                `}
              >
                {imageFiles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Imagen ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        {/* Overlay de progreso */}
                        {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                          <div className="absolute inset-0 bg-black/70 rounded-xl flex flex-col items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-pedal-primary-glow mb-1" />
                            <span className="text-white text-xs">{uploadProgress[file.name]}%</span>
                          </div>
                        )}
                        {/* Badge de éxito */}
                        {imageUrls[index] && uploadProgress[file.name] === 100 && (
                          <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          disabled={uploadingImages}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 backdrop-blur-sm rounded-lg
                            text-white/70 hover:text-pedal-primary-glow transition-all hover:scale-105 opacity-0 group-hover:opacity-100
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {imageFiles.length < CLOUDINARY_CONFIG.maxFiles && !uploadingImages && (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl hover:border-pedal-primary-glow/30 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 text-white/40 mb-1" />
                        <p className="text-white/40 text-xs">Agregar más</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-42 text-center">
                    <div className="p-4 rounded-3xl bg-pedal-primary-glow/10 mb-4">
                      <Upload className="w-12 h-12 text-pedal-primary-glow" />
                    </div>
                    <p className="text-white/70 font-syne mb-2">
                      Haz clic o arrastra imágenes
                    </p>
                    <p className="text-white/40 text-sm">
                      PNG, JPG, GIF hasta 10MB cada una (Máx. 5 imágenes)
                    </p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                disabled={uploadingImages}
              />
              
              {imageFiles.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <p className="text-white/40">
                    {imageFiles.length} de {CLOUDINARY_CONFIG.maxFiles} imágenes seleccionadas
                    {uploadingImages && " (subiendo...)"}
                  </p>
                  {imageUrls.length > 0 && !uploadingImages && (
                    <p className="text-green-400">
                      ✓ {imageUrls.length} subida(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sección de Detalles */}
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-white/70 font-syne text-sm font-semibold mb-2">
                  <Tag className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                  Título del Producto
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Auriculares Inalámbricos Pro"
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl
                    text-white placeholder-white/30 focus:outline-none focus:border-pedal-primary-glow/50
                    focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Precio y Stock en la misma fila */}
              <div className="grid grid-cols-2 gap-4">
                {/* Precio */}
                <div>
                  <label className="block text-white/70 font-syne text-sm font-semibold mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                    Precio
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className="w-full pl-5 pr-5 py-3 bg-white/5 border border-white/10 rounded-xl
                        text-white placeholder-white/30 focus:outline-none focus:border-pedal-primary-glow/50
                        focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-white/70 font-syne text-sm font-semibold mb-2">
                    <Package className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                    Stock
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl
                      text-white placeholder-white/30 focus:outline-none focus:border-pedal-primary-glow/50
                      focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-white/70 font-syne text-sm font-semibold mb-2">
                  <Package className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl
                    text-white focus:outline-none focus:border-pedal-primary-glow/50
                    focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all cursor-pointer"
                  required
                  disabled={isLoadingCategories || isSubmitting}
                >
                  <option value="" className="bg-pedal-bgSurface">
                    {isLoadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}
                  </option>
                  {!isLoadingCategories && categories.map((category) => (
                    <option 
                      key={category.id} 
                      value={category.id}
                      className="bg-pedal-bgSurface"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                
                {errorCategories && (
                  <p className="text-red-400 text-sm mt-2">{errorCategories}</p>
                )}
                
                {!isLoadingCategories && categories.length === 0 && !errorCategories && (
                  <p className="text-yellow-400 text-sm mt-2">
                    No hay categorías disponibles. Por favor, crea una categoría primero.
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white/70 font-syne text-sm font-semibold mb-2">
                  <FileText className="w-4 h-4 inline mr-2 text-pedal-primary-glow" />
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe las características, especificaciones y beneficios del producto..."
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl
                    text-white placeholder-white/30 focus:outline-none focus:border-pedal-primary-glow/50
                    focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Mensaje informativo sobre imágenes */}
          {imageFiles.length > 0 && uploadingImages && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm text-center flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo imágenes automáticamente... Espera antes de publicar
              </p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="mt-10 flex gap-4 justify-end">
            <Link
            href={"/admin/products"}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70
                font-syne font-semibold transition-all hover:scale-[1.02] hover:bg-white/10
                hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPublishDisabled()}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-pedal-primary-glow to-amber-600
                text-black font-syne font-bold transition-all hover:scale-[1.02] 
                shadow-lg hover:shadow-pedal-primary-glow/25 flex items-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : uploadingImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo imágenes...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Publicar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}