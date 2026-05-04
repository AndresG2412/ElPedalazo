"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  ShieldCheck, 
  Loader2,
  X,
  Plus,
  ArrowLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { getAllAdmins, addAdmin, deleteAdmin, Admin } from "@/firebase/usuarios";
import Link from "next/link";
import Container from "@/app/components/Container";

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Error loading admins:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los administradores.",
        background: "#161616",
        color: "#FAF7F2",
        confirmButtonColor: "#D97706",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setIsSubmitting(true);
      const result = await addAdmin({
        name: formData.name,
        email: formData.email,
        role: "admin",
      });

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: result.message,
          background: "#161616",
          color: "#FAF7F2",
          confirmButtonColor: "#D97706",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsModalOpen(false);
        setFormData({ name: "", email: "" });
        fetchAdmins();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error?.message || "Ocurrió un error inesperado.",
          background: "#161616",
          color: "#FAF7F2",
          confirmButtonColor: "#D97706",
        });
      }
    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (email: string, name: string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminarás el acceso administrativo para ${name} (${email}).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#333",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#161616",
      color: "#FAF7F2",
    });

    if (confirm.isConfirmed) {
      try {
        const result = await deleteAdmin(email);
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: result.message,
            background: "#161616",
            color: "#FAF7F2",
            confirmButtonColor: "#D97706",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchAdmins();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.error?.message || "No se pudo eliminar el administrador.",
            background: "#161616",
            color: "#FAF7F2",
            confirmButtonColor: "#D97706",
          });
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    }
  };

  return (
    <Container>
    <div className="min-h-screen bg-pedal-bgMain pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl md:text-4xl font-syne font-bold text-pedal-textHeading mb-2">
              Administradores
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-pedal-primary hover:bg-pedal-primary-glow text-pedal-primary-text px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pedal-primary/20"
            >
              <UserPlus size={20} />
              Añadir Administrador
            </button>
          </div>
          <div className="flex flex-col gap-y-4 items-end justify-end">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-pedal-primary-glow hover:text-amber-600 transition-colors hover:scale-[1.02]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-pedal-primary mb-4" size={48} />
            <p className="text-pedal-textMuted animate-pulse">Cargando administradores...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-pedal-bgSurface border border-pedal-glassBorder rounded-2xl p-12 text-center">
            <ShieldCheck size={64} className="mx-auto text-pedal-textMuted/20 mb-4" />
            <h3 className="text-xl font-bold text-pedal-textHeading mb-2">No hay otros administradores</h3>
            <p className="text-pedal-textMuted max-w-md mx-auto">
              Solo tú tienes acceso administrativo actualmente. Utiliza el botón superior para invitar a otros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {admins.map((admin) => (
                <motion.div
                  key={admin.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-pedal-bgCard border border-pedal-glassBorder hover:border-pedal-primary/30 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-pedal-primary/5 relative overflow-hidden"
                >
                  {/* Decorative background element */}
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck size={120} className="text-pedal-primary" />
                  </div>

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="w-12 h-12 bg-pedal-primary/10 rounded-xl flex items-center justify-center text-pedal-primary">
                      <User size={24} />
                    </div>
                    <button
                      onClick={() => handleDeleteAdmin(admin.email, admin.name)}
                      className="text-pedal-textMuted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Eliminar administrador"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-pedal-textHeading mb-1 truncate">
                      {admin.name}
                    </h3>
                    <div className="flex items-center gap-2 text-pedal-textMuted text-sm mb-4">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pedal-primary/20 text-pedal-primary text-xs font-bold rounded-full border border-pedal-primary/20">
                      <ShieldCheck size={12} />
                      ADMINISTRADOR
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-pedal-bgSurface border border-pedal-glassBorder rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-syne font-bold text-pedal-textHeading">
                    Nuevo <span className="text-pedal-primary">Admin</span>
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-pedal-textMuted hover:text-pedal-textHeading transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddAdmin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-pedal-textMuted mb-2">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pedal-textMuted" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-pedal-bgInput border border-pedal-glassBorder focus:border-pedal-primary/50 rounded-xl py-3 pl-12 pr-4 text-pedal-textHeading placeholder:text-pedal-textMuted/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pedal-textMuted mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pedal-textMuted" size={18} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="admin@elpedalazo.com"
                        className="w-full bg-pedal-bgInput border border-pedal-glassBorder focus:border-pedal-primary/50 rounded-xl py-3 pl-12 pr-4 text-pedal-textHeading placeholder:text-pedal-textMuted/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-pedal-primary hover:bg-pedal-primary-glow disabled:opacity-50 disabled:cursor-not-allowed text-pedal-primary-text py-4 rounded-xl font-bold mt-8 transition-all transform active:scale-95"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Plus size={20} />
                        Crear Acceso
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </Container>
  );
}