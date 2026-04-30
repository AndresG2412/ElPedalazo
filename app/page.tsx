import Hero from "./components/Hero";
import Carrousel from "./components/Carrousel";
import Categorias from "./components/Categorias";
import Performance from "./components/Performance";
import Location from "./components/Location";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Carrousel />
      <Categorias />
      <Performance />
      <Location />
      <Footer />
    </main>
  );
}
