import Container from "../components/Container";
import { LayoutDashboard, PlusCircle, Package, Users, Tag, Text } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
    const adminActions = [
        { title: "Productos", icon: PlusCircle, href: "/admin/products", color: "text-pedal-primary-glow" },
        { title: "Categorías", icon: Package, href: "/admin/categories", color: "text-white" },
        { title: "Marcas", icon: Tag, href: "/admin/marcas", color: "text-white" },
        { title: "Automático", icon: Text, href: "/admin/docsia", color: "text-white" },
        { title: "Usuarios", icon: Users, href: "/admin/users", color: "text-white" },
    ];

    return (
        <div className="min-h-screen bg-pedal-bgMain pt-32 pb-20">
            <Container>
                <div className="flex items-center gap-4 mb-12 animate-fade-up">
                    <div className="p-3 bg-pedal-primary-glow/10 rounded-2xl border border-pedal-primary-glow/20">
                        <LayoutDashboard className="text-pedal-primary-glow" size={32} />
                    </div>
                    <div>
                        <p className="text-pedal-primary-glow font-medium text-sm uppercase tracking-widest">Panel de Control</p>
                        <h1 className="text-4xl font-bold text-white font-syne">Administración</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
                    {adminActions.map((action, index) => (
                        <Link 
                            key={index} 
                            href={action.href}
                            className="group p-8 bg-pedal-bgSurface border border-white/5 rounded-4xl hover:border-pedal-primary-glow/30 transition-all hover:translate-y-[-4px]"
                        >
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <action.icon className={`${action.color} group-hover:scale-110 transition-transform`} size={32} />
                                    <h3 className="text-xl font-bold text-white">{action.title}</h3>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm">Gestionar sección de {action.title.toLowerCase()}.</p>
                        </Link>
                    ))}
                </div>
            </Container>
        </div>
    );
}