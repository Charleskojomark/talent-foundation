import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { RegistrationsClient } from "./RegistrationsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    let regs: any[] = [];
    let loadError = null;

    try {
        regs = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
    } catch (error: any) {
        loadError = error.message;
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load registrations: {loadError}
                </div>
            </div>
        );
    }

    return <RegistrationsClient initialData={regs || []} />;
}
