'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Trash2, ImagePlus, GripVertical, Loader2, AlertCircle } from 'lucide-react';
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
  isOpen: boolean;
  producto: Producto;
  onClose: () => void;
  onSave: (productoActualizado: Producto) => Promise<void>;
}

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

export default function EditProductModal({ isOpen, producto, onClose, onSave }: EditProductModalProps) {
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

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-pedal-bgSurface rounded-3xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="font-syne font-bold text-2xl text-white">
                Editar Producto
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Imágenes */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Imágenes *</label>
                <div className="grid grid-cols-4 gap-2">
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
                            : 'border-white/10 hover:border-white/20'
                          }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                        transition-opacity flex items-center justify-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-white/60" />
                          <button
                            onClick={() => removeImage(idx)}
                            disabled={isLast}
                            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors
                                        ${isLast ? 'bg-white/10 cursor-not-allowed opacity-40' : 'bg-red-500/80 hover:bg-red-500'}`}
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border border-dashed border-white/15 flex flex-col items-center justify-center gap-1 hover:border-white/30 hover:bg-white/5 transition-all"
                    >
                      <ImagePlus className="w-5 h-5 text-white/30" />
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
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Nombre del producto *</label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
                  placeholder="Ej: Casco Fox Ranger"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Categoría *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all cursor-pointer"
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
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all resize-none"
                  placeholder="Describe el producto..."
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Precio COL *</label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
                  />
                </div>
              </div>

              {/* Error general */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-pedal-primary-glow hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}