import { createClient } from "@/lib/supabase/server";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    const supabase = await createClient();

    const { data: announcements, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load announcements: {error.message}
                </div>
            </div>
        );
    }

    return <AnnouncementsClient initialData={announcements || []} />;
}
