import { db } from "@/lib/db";
import { judges } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { JudgesClient } from "./JudgesClient";

export const dynamic = "force-dynamic";

export default async function JudgesPage() {
    let judgesItems: any[] = [];
    let loadError = null;

    try {
        judgesItems = await db.select().from(judges).orderBy(desc(judges.createdAt));
    } catch (error: any) {
        loadError = error.message;
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load judges: {loadError}
                </div>
            </div>
        );
    }

    return <JudgesClient initialData={judgesItems || []} />;
}
