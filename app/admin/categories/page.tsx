'use client';

import Container from '@/app/components/Container';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CategorySearch from '@/app/components/SearchInput';
import CreateCategoryBtn from '@/app/components/CreateCategoryBtn';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
} from '@/firebase/categories';

import type { Category } from '@/firebase/categories';
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

  const handleSave = async () => {
    // ... (Tu lógica de validación y guardado se mantiene igual)
  };

  const handleDelete = async (category: Category) => {
    // ... (Tu lógica de eliminación se mantiene igual)
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
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <h1 className="font-syne font-bold text-4xl md:text-5xl text-white tracking-tight">
                Categorías
              </h1>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-pedal-primary-glow hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Regresar</span>
              </Link>
            </div>
          </motion.div>

          {/* Barra de búsqueda y botón (Componentes extraídos) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <CategorySearch 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
            <CreateCategoryBtn />
          </motion.div>

          {/* Grid de categorías */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-pedal-primary-glow animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <motion.div className="text-center py-20">
              <p className="text-white/50 text-lg mb-6">
                {searchTerm ? 'No se encontraron categorías' : 'No hay categorías aún'}
              </p>
              {!searchTerm && <CreateCategoryBtn label="Crear primera categoría" />}
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