import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Container from "./components/Container";

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
      <body className="min-h-full flex flex-col bg-[#0d0d0d] text-white pt-6">
        <Container>
          <Navbar />
          {children}
        </Container>
      </body>
    </html>
  );
}
