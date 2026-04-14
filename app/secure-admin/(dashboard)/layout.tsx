"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Star,
    Image as ImageIcon,
    Bell,
    LogOut,
    Gavel,
    Ticket,
    Mail
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navigation = [
        { name: "Dashboard", href: "/secure-admin", icon: LayoutDashboard },
        { name: "Registrations", href: "/secure-admin/registrations", icon: Users },
        { name: "Contestants", href: "/secure-admin/contestants", icon: Star },
        { name: "Gallery", href: "/secure-admin/gallery", icon: ImageIcon },
        { name: "Announcements", href: "/secure-admin/announcements", icon: Bell },
        { name: "Judges", href: "/secure-admin/judges", icon: Gavel },
        { name: "Tickets", href: "/secure-admin/tickets", icon: Ticket },
        { name: "Emails Hub", href: "/secure-admin/emails", icon: Mail },
    ];

    const handleLogout = async () => {
        await fetch("/api/secure-admin/logout", { method: "POST" });
        router.push("/secure-admin/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:flex flex-col relative z-20">
                <div className="p-6 border-b border-white/10">
                    <Link href="/secure-admin" className="text-xl font-black tracking-tight">
                        TGI <span className="text-gradient-gold">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/secure-admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-gradient-to-tr from-gold to-gold-light text-black shadow-[0_0_15px_rgba(223,177,75,0.4)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-black" : "opacity-70"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all w-full"
                    >
                        <LogOut className="w-5 h-5 opacity-70" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto h-screen">
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 pt-[10%] to-transparent pointer-events-none -z-10" />
                {children}
            </main>

            {/* Mobile Nav Overlay could go here, omitting for simplicity since admin panels are generally desktop focused */}
        </div>
    );
}
