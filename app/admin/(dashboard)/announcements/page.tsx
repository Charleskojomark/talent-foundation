import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    let announcementItems: any[] = [];
    let loadError = null;

    try {
        announcementItems = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
    } catch (error: any) {
        loadError = error.message;
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load announcements: {loadError}
                </div>
            </div>
        );
    }

    return <AnnouncementsClient initialData={announcementItems || []} />;
}
