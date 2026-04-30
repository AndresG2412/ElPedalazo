export const MARQUEE_PHRASES = [
    "ENVIOS A TODA COLOMBIA",
    "DISEÑOS AERODINAMICOS",
    "PERFORMANCE AL MAXIMO",
    "TECNOLOGIA DE CARBONO",
];

export const FOOTER_CONTACTO = [
    {
        "Dirección": "Carrera 5 #9-53  Pitalito - Huila"
    },
    {
        "Telefono": "311 449 7589"
    },
    {
        "Correo": "clubpedalazo@gmail.com"
    }
];

export const FOOTER_REDES = [
  { red: "Instagram", url: "https://instagram.com/clubpedalazo" },
  { red: "Facebook",  url: "https://facebook.com/clubpedalazo" },
  { red: "WhatsApp",  url: "https://wa.me/573114497589" },
];

export const NAV_LINKS = [
    { label: 'Inicio', href: '/#inicio' },
    { label: 'Categorias', href: '/#categorias' },
    { label: 'Productos', href: '/#productos' },
    { label: 'Para tu Carro!', href: '/#carro' },
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Contacto', href: '/#contacto' },
];

export const CATEGORIAS = [
  {
    title: "Montaña (MTB)",
    description: "XC, trail y enduro. Domina cualquier terreno con precisión.",
    icon: Mountain,
    className: "col-span-1 md:col-span-2 row-span-1",
    image: imgMontaña,
  },
  {
    title: "Ruta",
    description: "Aerodinámica y velocidad en el asfalto.",
    icon: Wind,
    className: "col-span-1 row-span-1",
    image: imgScott,
  },
  {
    title: "E-Bikes",
    description: "El futuro es hoy. Asistencia eléctrica para cruzar horizontes sin límites.",
    icon: Zap,
    className: "col-span-1 md:col-span-1 md:row-span-2",
    image: imgBikeE,
  },
  {
    title: "Gravel",
    description: "Versatilidad en caminos mixtos.",
    icon: Map,
    className: "col-span-1 row-span-1",
    image: imgGravel,
  },
  {
    title: "Accesorios Premium",
    description: "Cascos, luces, indumentaria y herramientas vitales.",
    icon: Shield,
    className: "col-span-1 md:col-span-2 row-span-1",
    image: imgAccesorios,
  },
];

import imgMontaña from "@/app/images/mtb_premium.png"
import imgGravel from "@/app/images/road_premium.png"
import imgAccesorios from "@/app/images/scott-accessories.png"
import imgBikeE from "@/app/images/scott-ebike.png"
import imgScott from "@/app/images/scott-gravel.png"
import { Mountain, Wind, Map, Shield, Zap } from "lucide-react";
