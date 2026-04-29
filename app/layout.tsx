import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Syne } from "next/font/google";

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "El Pedalazo - Pitalito",
  description: "Tienda de bicicletas en Pitalito, Huila",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${syne.variable} min-h-full flex flex-col bg-[#0d0d0d] text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
