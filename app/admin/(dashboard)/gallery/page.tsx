import { createClient } from "@/lib/supabase/server";
import { GalleryClient } from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
    const supabase = await createClient();

    const { data: galleryItems, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load gallery: {error.message}
                </div>
            </div>
        );
    }

    return <GalleryClient initialData={galleryItems || []} />;
}
