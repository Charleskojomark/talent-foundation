import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { RegistrationsClient } from "../registrations/RegistrationsClient";

export const dynamic = "force-dynamic";

export default async function ContestantsPage() {
    let contestants: any[] = [];
    let loadError = null;

    try {
        contestants = await db.select().from(registrations).where(eq(registrations.status, "verified")).orderBy(desc(registrations.createdAt));
    } catch (error: any) {
        loadError = error.message;
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load contestants: {loadError}
                </div>
            </div>
        );
    }

    return <RegistrationsClient initialData={contestants || []} isContestantsOnly={true} />;
}
