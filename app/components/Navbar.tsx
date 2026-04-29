import { Search, ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="w-full py-3 px-8 flex items-center justify-between border border-pedal-primary-glow/20 rounded-full ">
            <div className='font-bold text-2xl cursor-default'>El Pedalazo</div>

            <div className='flex text-sm gap-x-5 uppercase font-semibold tracking-wide'>
                <a href="#" className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'>Inicio</a>
                <a href="#Proyectos" className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'>Categorias</a>
                <a href="#Recorrido" className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'>Productos</a>
                <a href="#Contacto" className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'>Para tu Carro!</a>
                <a href="#Contacto" className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'>Servicios</a>
                <a href="#Contacto" className='hover:text-pedal-primary-glow hover:border-b hover:border-pedal-primary-glow hover:scale-110 transition-transform cursor-pointer'>Contacto</a>
            </div>

            <div className='flex items-center gap-x-3 text-md'>
                <button className='hover:scale-110 transition-transform cursor-pointer'><Search /></button>
                <button className='hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'><ShoppingCart /></button>
                <button className='hover:scale-110 transition-transform cursor-pointer border border-white/30 rounded-full p-2'><User /></button>
            </div>
        </nav>
    );
}
