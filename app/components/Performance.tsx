"use client";

import React, { useState } from 'react';
import { Settings, Activity, UserCog, Calendar, ChevronDown } from 'lucide-react';
import Container from './Container';
import Swal from 'sweetalert2';

export default function Performance() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    servicio: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.telefono || !formData.servicio) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    Swal.fire({
      title: '¡Solicitud enviada!',
      text: 'Tu solicitud fue enviada. Serás contactado prontamente para ajustar la hora de tu cita.',
      icon: 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      background: '#111',
      color: '#f4f4f5'
    });
    setFormData({ nombre: '', telefono: '', servicio: '' });
  };

  return (
    <section className="py-24 bg-[#050505]" id="servicios">
      <Container>
        <div className='max-w-5xl mx-auto'>
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-4">
            
            {/* Columna Izquierda - Contenido */}
            <div className="flex flex-col justify-center">
                <h2 className="text-[3.5rem] font-syne font-black text-[#e5e5e5] leading-[0.85] uppercase tracking-wide mb-4">
                <span
                    className="block z-10"
                    style={{
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: '2px rgba(255,255,255,0.85)',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                    }}
                >BOOST</span>
                <span className="block">LAB</span>
                </h2>

                <div className="pr-10">
                <p className="text-[#a1a1aa] text-lg font-sans mb-8 max-w-[90%] leading-relaxed">
                    Más que un taller, es el centro neurálgico para mantener tu máquina en estado de competencia.
                </p>
                </div>

                <div className="flex flex-col gap-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-5">
                    <div className="p-3.5 rounded-2xl bg-[#111] border border-[#f59e0b]/20 text-[#f59e0b] shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <Settings size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                    <h3 className="text-[#f4f4f5] font-syne font-bold text-xl mb-1.5">Mantenimiento Avanzado</h3>
                    <p className="text-[#71717a] text-sm font-sans leading-relaxed">Desensamble, limpieza ultrasónica y torque preciso.</p>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-5">
                    <div className="p-3.5 rounded-2xl bg-[#111] border border-[#f59e0b]/20 text-[#f59e0b] shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <Activity size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                    <h3 className="text-[#f4f4f5] font-syne font-bold text-xl mb-1.5">Ajuste y Suspensión</h3>
                    <p className="text-[#71717a] text-sm font-sans leading-relaxed">Telemetría y ajuste fino para dominar el sendero.</p>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-5">
                    <div className="p-3.5 rounded-2xl bg-[#111] border border-[#f59e0b]/20 text-[#f59e0b] shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <UserCog size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                    <h3 className="text-[#f4f4f5] font-syne font-bold text-xl mb-1.5">Asesoría y Personalización</h3>
                    <p className="text-[#71717a] text-sm font-sans leading-relaxed">Biometría y armado a la medida de tu fisionomía.</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Columna Derecha - Formulario */}
            <div className="bg-[#0a0a0a] p-8 rounded-4xl border border-[#27272a]/60 shadow-2xl relative overflow-hidden">
                <h3 className="text-3xl font-syne font-bold text-white mb-2">Agendar Intervención</h3>
                <p className="text-[#a1a1aa] text-sm font-sans mb-5">Reserva tu espacio en el taller especializado.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                <input
                    type="text"
                    placeholder="Tu Nombre"
                    required
                    className="w-full text-sm bg-[#111] border border-[#27272a] rounded-sm px-3 py-2 text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:border-[#f59e0b] transition-colors font-sans"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />

                <input
                  type="tel"
                  placeholder="WhatsApp / Teléfono (10 dígitos)"
                  required
                  className="w-full text-sm bg-[#111] border border-[#27272a] rounded-sm px-3 py-2 text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:border-[#f59e0b] transition-colors font-sans"
                  value={formData.telefono}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Solo permite números y un máximo de 10 caracteres
                    if (/^\d*$/.test(val) && val.length <= 10) {
                      setFormData({ ...formData, telefono: val });
                    }
                  }}
                  minLength={10} // Validación nativa al intentar enviar el formulario
                  maxLength={10} // Evita que escriban más de 10
                />

                <div className="relative">
                    <select
                    required
                    className="w-full text-sm bg-[#111] border border-[#27272a] rounded-sm px-3 py-2 text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:border-[#f59e0b] transition-colors font-sans appearance-none"
                    value={formData.servicio}
                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                    >
                    <option value="" disabled className="text-[#52525b]">Selecciona el servicio...</option>
                    <option value="mantenimiento">Mantenimiento Avanzado</option>
                    <option value="suspension">Ajuste y Suspensión</option>
                    <option value="personalizacion">Asesoría y Personalización</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none" size={20} />
                </div>

                <button
                    type="submit"
                    className="w-full text-md bg-white hover:bg-pedal-primary text-black font-semibold tracking-wider uppercase rounded-full px-3 py-2 flex items-center justify-center gap-3 transition-colors mt-4"
                >
                    SOLICITAR ESPACIO
                    <Calendar size={22} strokeWidth={2.5} />
                </button>
                </form>
            </div>

            </div>
        </div>
      </Container>
    </section>
  );
}