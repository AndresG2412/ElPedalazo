import Hero from "./components/Hero";
import Carrousel from "./components/Carrousel";
import Categorias from "./components/Categorias";
import Performance from "./components/Performance";

export default function Home() {
  return (
    <main>
      <Hero />
      <Carrousel />
      <Categorias />
      <Performance />
    </main>
  );
}
