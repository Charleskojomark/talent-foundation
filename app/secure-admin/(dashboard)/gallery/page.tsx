import { db } from "@/lib/db";
import { gallery } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { GalleryClient } from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
    let galleryItems: any[] = [];
    let loadError = null;

    try {
        galleryItems = await db.select().from(gallery).orderBy(desc(gallery.createdAt));
    } catch (error: any) {
        loadError = error.message;
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load gallery: {loadError}
                </div>
            </div>
        );
    }

    return <GalleryClient initialData={galleryItems || []} />;
}
