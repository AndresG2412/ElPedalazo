'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Trash2, ImagePlus, GripVertical, Save, AlertCircle, Sparkles, Loader2, Package } from 'lucide-react';
import { getAllCategories, Category } from '@/firebase/categories';

interface Producto {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: any;
  updatedAt: any;
}

interface EditProductModalProps {
  producto: Producto;
  onClose: () => void;
  onSave: (productoActualizado: Producto) => Promise<void>;
}

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

export default function EditProductModal({ producto, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    title: producto.title,
    description: producto.description,
    price: producto.price,
    stock: producto.stock,
    category: producto.category,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>(producto.images ?? []);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await getAllCategories();
        setCategories(data);
        setErrorCategories(null);
      } catch (err: any) {
        console.error("Error loading categories:", err);
        setErrorCategories("No se pudieron cargar las categorías.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const canRemoveImage = images.length > MIN_IMAGES;

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;
      const slice = Array.from(files).slice(0, remaining);
      const urls = await Promise.all(slice.map(readFileAsDataUrl));
      setImages((prev) => [...prev, ...urls]);
      setError(null);
    },
    [images.length],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addImages(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    if (!canRemoveImage) {
      setError('Debe haber al menos una imagen.');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setError(null);
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);

  const handleDragEnter = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIndex(idx);
  };

  const handleDragEnd = () => setDragIndex(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.title.trim()) return setError('El nombre del producto es requerido.');
    if (formData.price <= 0) return setError('El precio debe ser mayor a 0.');
    if (images.length < MIN_IMAGES) return setError('Agrega al menos una imagen.');

    setSaving(true);
    try {
      await onSave({ ...producto, ...formData, images });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Ocurrió un error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay: solo blur, sin fondo negro */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] flex flex-col
                     bg-pedal-bgSurface rounded-2xl border border-white/8
                     shadow-[0_32px_80px_rgba(0,0,0,0.6)]
                     animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
            <div>
              <h2 className="font-syne font-bold text-xl text-white">Editar producto</h2>
              <p className="text-white/40 text-xs mt-0.5 truncate max-w-xs">{producto.id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40
                         hover:text-white hover:bg-white/8 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Imágenes */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                  Imágenes
                </span>
                <span className="text-white/30 text-[11px]">
                  {images.length} / {MAX_IMAGES}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {images.map((src, idx) => {
                  const isLast = images.length === MIN_IMAGES;
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={handleDragEnd}
                      className={`relative group aspect-square rounded-xl overflow-hidden border
                                  cursor-grab active:cursor-grabbing transition-all duration-150
                                  ${dragIndex === idx
                                    ? 'border-pedal-primary-glow/60 scale-95 opacity-60'
                                    : 'border-white/8 hover:border-white/20'
                                  }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                      transition-opacity flex items-center justify-center gap-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-white/60" />
                        <button
                          onClick={() => removeImage(idx)}
                          disabled={isLast}
                          title={isLast ? 'Debe quedar al menos una imagen' : 'Eliminar imagen'}
                          className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors
                                      ${isLast
                                        ? 'bg-white/10 cursor-not-allowed opacity-40'
                                        : 'bg-red-500/80 hover:bg-red-500'
                                      }`}
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold
                                         bg-pedal-primary-glow/80 text-black rounded px-1 py-0.5 leading-none">
                          PORTADA
                        </span>
                      )}
                    </div>
                  );
                })}

                {images.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col
                                items-center justify-center gap-1 transition-all duration-200
                                ${dragOver
                                  ? 'border-pedal-primary-glow bg-pedal-primary-glow/10'
                                  : 'border-white/15 hover:border-white/30 hover:bg-white/4'
                                }`}
                  >
                    <ImagePlus className="w-5 h-5 text-white/30" />
                    <span className="text-[9px] text-white/25 font-medium">Agregar</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <p className="text-white/25 text-[11px] mt-2">
                Arrastra para reordenar · La primera imagen es la portada · Máx. {MAX_IMAGES} · Mín. {MIN_IMAGES}
              </p>
            </section>

            {/* Campos */}
            <section className="space-y-4">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest block">
                Información
              </span>

              <Field label="Nombre del producto">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej. Casco Fox Ranger"
                  className={inputCls}
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe el producto…"
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio COL">
                  <div className="relative">
                    <input
                      name="price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.price}
                      onChange={handleChange}
                      className={`${inputCls} pl-3`}
                    />
                  </div>
                </Field>
                <Field label="Stock">
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Categoría">
                <div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl
                      text-white focus:outline-none focus:border-pedal-primary-glow/50
                      focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all cursor-pointer"
                    required
                    disabled={isLoadingCategories || saving}
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
              </Field>
            </section>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20
                              px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/6 shrink-0 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70
                font-syne font-semibold transition-all hover:scale-[1.02] hover:bg-white/10
                hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-pedal-primary-glow to-amber-600
                text-black font-syne font-bold transition-all hover:scale-[1.02] 
                shadow-lg hover:shadow-pedal-primary-glow/25 flex items-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Publicar Producto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/50 text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white ' +
  'placeholder:text-white/20 outline-none focus:border-pedal-primary-glow/50 ' +
  'focus:bg-white/6 transition-colors duration-150';