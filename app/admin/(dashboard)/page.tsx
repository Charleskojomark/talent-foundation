import { createClient } from "@/lib/supabase/server";
import { Users, Star, Image as ImageIcon, Bell } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch quick stats with error handling
    const fetchCount = async (query: any) => {
        try {
            const { count, error } = await query;
            if (error) {
                console.error("Dashboard Fetch Error:", error);
                return 0;
            }
            return count || 0;
        } catch (err) {
            console.error("Dashboard exception:", err);
            return 0;
        }
    };

    const [
        registrationsCount,
        contestantsCount,
        galleryCount,
        announcementsCount
    ] = await Promise.all([
        fetchCount(supabase.from("registrations").select("*", { count: "exact", head: true })),
        fetchCount(supabase.from("registrations").select("*", { count: "exact", head: true }).eq('status', 'verified')),
        fetchCount(supabase.from("gallery").select("*", { count: "exact", head: true })),
        fetchCount(supabase.from("announcements").select("*", { count: "exact", head: true })),
    ]);

    const stats = [
        { title: "Total Registrations", value: registrationsCount || 0, icon: Users, href: "/admin/registrations", color: "from-blue-500/20 to-blue-500/0 text-blue-400" },
        { title: "Verified Contestants", value: contestantsCount || 0, icon: Star, href: "/admin/contestants", color: "from-gold/20 to-gold/0 text-gold-light" },
        { title: "Gallery Items", value: galleryCount || 0, icon: ImageIcon, href: "/admin/gallery", color: "from-purple-500/20 to-purple-500/0 text-purple-400" },
        { title: "Announcements", value: announcementsCount || 0, icon: Bell, href: "/admin/announcements", color: "from-green-500/20 to-green-500/0 text-green-400" },
    ];

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-2">Welcome to your <span className="text-gradient-gold">Dashboard</span></h1>
                <p className="text-gray-400">Here is an overview of your platform's activity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]}`} />

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-black/50 border border-white/5 ${stat.color.split(' ')[2]}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>

                        <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-3xl border border-white/10">
                    <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                    <div className="text-gray-400 text-sm text-center py-10">
                        More features coming soon... (e.g. Recent Registrations list)
                    </div>
                </div>
            </div>
        </div>
    );
}
