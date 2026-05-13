'use client';

import Container from '@/app/components/Container';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, ArrowLeft, Box } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MarcaSearch from '@/app/components/SearchInput';
import CreateMarcaBtn from '@/app/components/CreateMarcaBtn';
import {
  getAllMarcas,
  createMarca,
  updateMarca,
  deleteMarca,
  searchMarcas,
} from '@/firebase/marcas';

import type { Marca } from '@/firebase/marcas';
import MarcaCard from '@/app/components/MarcaCard';
import MarcaModal from '@/app/components/MarcaModal';

export default function Marcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [filteredMarcas, setFilteredMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState({ name: '' });
  const [formErrors, setFormErrors] = useState({ name: '' });

  const loadMarcas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllMarcas();
      setMarcas(data);
      setFilteredMarcas(data);
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
    loadMarcas();
  }, [loadMarcas]);

  useEffect(() => {
    const searchMarcasHandler = async () => {
      if (searchTerm.trim() === '') {
        setFilteredMarcas(marcas);
      } else {
        try {
          const results = await searchMarcas(searchTerm);
          setFilteredMarcas(results);
        } catch (error) {
          console.error('Error searching:', error);
        }
      }
    };

    const debounce = setTimeout(searchMarcasHandler, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, marcas]);

  const handleSave = async () => {
    // Reset errors
    setFormErrors({ name: '' });
    
    // Validation
    if (!formData.name.trim()) {
      setFormErrors(prev => ({ ...prev, name: 'El nombre es requerido' }));
      return;
    }

    try {
      setLoading(true);
      if (modalMode === 'create') {
        const result = await createMarca(formData);
        if (!result.success) throw new Error(result.error?.message);
      } else if (modalMode === 'edit' && selectedMarca) {
        await updateMarca(selectedMarca.id, formData);
      }
      
      await loadMarcas();
      setIsModalOpen(false);
      
      await Swal.fire({
        title: 'Éxito',
        text: `Marca ${modalMode === 'create' ? 'creada' : 'actualizada'} correctamente.`,
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fbbf24'
      });
    } catch (error: any) {
      await Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (marca: Marca) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar la marca "${marca.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await deleteMarca(marca.id);
        await loadMarcas();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'La marca ha sido eliminada con éxito.',
          icon: 'success',
          background: '#0a0a0a',
          color: '#fff',
          confirmButtonColor: '#fbbf24'
        });
        
        if (isModalOpen) setIsModalOpen(false);
      } catch (error: any) {
        await Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          background: '#0a0a0a',
          color: '#fff'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditCard = (marca: Marca) => {
    setSelectedMarca(marca);
    setModalMode('edit');
    setFormData({ name: marca.name });
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
                Marcas
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

          {/* Barra de búsqueda y botón */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <MarcaSearch 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              placeholder="Buscar marcas..."
            />
            <CreateMarcaBtn />
          </motion.div>

          {/* Grid de marcas */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-pedal-primary-glow animate-spin" />
            </div>
          ) : filteredMarcas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-pedal-bgSurface border border-white/5 rounded-4xl text-center animate-fade-up mt-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Box size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 font-syne">No hay marcas registradas</h2>
                        <p className="text-white/50 mb-8">Parece que aún no has añadido ninguna marca.</p>
                    </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredMarcas.map((marca, index) => (
                  <MarcaCard
                    key={marca.id}
                    marca={marca}
                    index={index}
                    onEdit={handleEditCard}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <MarcaModal
          isOpen={isModalOpen}
          modalMode={modalMode}
          selectedMarca={selectedMarca}
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