'use client';

import Container from '@/app/components/Container';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
} from '@/firebase/categories';

import type { Category } from '@/firebase/categories';
import Link from 'next/link';
import CategoryCard from '@/app/components/CategoryCard';
import CategoryModal from '@/app/components/CategoryModal';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({ name: '', description: '' });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error: any) {
      await Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        background: '#111111',
        color: '#ffffff',
        confirmButtonColor: '#F59E0B',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const searchCategoriesHandler = async () => {
      if (searchTerm.trim() === '') {
        setFilteredCategories(categories);
      } else {
        try {
          const results = await searchCategories(searchTerm);
          setFilteredCategories(results);
        } catch (error) {
          console.error('Error searching:', error);
        }
      }
    };

    const debounce = setTimeout(searchCategoriesHandler, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, categories]);

  const validateForm = () => {
    const errors = { name: '', description: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
      isValid = false;
    } else if (modalMode === 'create' && categories.some(c => c.name === formData.name.trim())) {
      errors.name = 'Ya existe una categoría con este nombre';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (modalMode === 'create') {
        const result = await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });

        if (result.success) {
          await Swal.fire({
            title: '¡Éxito!',
            text: 'Categoría creada correctamente',
            icon: 'success',
            background: '#111111',
            color: '#ffffff',
            confirmButtonColor: '#F59E0B',
            timer: 2000,
            showConfirmButton: false,
          });
          await loadCategories();
          setIsModalOpen(false);
        } else {
          throw new Error(result.error?.message);
        }
      } else if (modalMode === 'edit' && selectedCategory) {
        await updateCategory(selectedCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });

        await Swal.fire({
          title: '¡Éxito!',
          text: 'Categoría actualizada correctamente',
          icon: 'success',
          background: '#111111',
          color: '#ffffff',
          confirmButtonColor: '#F59E0B',
          timer: 2000,
          showConfirmButton: false,
        });
        await loadCategories();
        setIsModalOpen(false);
      }
    } catch (error: any) {
      await Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        background: '#111111',
        color: '#ffffff',
        confirmButtonColor: '#F59E0B',
      });
    }
  };

  const handleDelete = async (category: Category) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de que deseas eliminar "${category.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#111111',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(category.id);
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La categoría ha sido eliminada',
          icon: 'success',
          background: '#111111',
          color: '#ffffff',
          confirmButtonColor: '#F59E0B',
          timer: 2000,
          showConfirmButton: false,
        });
        await loadCategories();
      } catch (error: any) {
        await Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          background: '#111111',
          color: '#ffffff',
          confirmButtonColor: '#F59E0B',
        });
      }
    }
  };

  const handleEditCard = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setFormData({ name: category.name, description: category.description || '' });
    setIsModalOpen(true);
  };

  return (
    <Container>
      <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between">
              <h1 className="font-syne font-bold text-4xl md:text-5xl text-white tracking-tight mb-2">
                Categorías
              </h1>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-pedal-primary-glow hover:text-amber-600 transition-colors hover:scale-[1.02]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Regresar</span>
              </Link>
            </div>
          </motion.div>

          {/* Barra de búsqueda y botón crear */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
              />
            </div>
            <Link
              href="/admin/categories/newCategory"
              className="bg-pedal-primary-glow hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </Link>
          </motion.div>

          {/* Grid de categorías */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-pedal-primary-glow animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-white/50 text-lg">
                {searchTerm ? 'No se encontraron categorías' : 'No hay categorías aún'}
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/categories/newCategory"
                  className="bg-pedal-primary-glow hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Crear primera categoría
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                    onEdit={handleEditCard}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Modal */}
        <CategoryModal
          isOpen={isModalOpen}
          modalMode={modalMode}
          selectedCategory={selectedCategory}
          formData={formData}
          formErrors={formErrors}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          onEditClick={() => setModalMode('edit')}
          onFormChange={setFormData}
        />
      </div>
    </Container>
  );
}