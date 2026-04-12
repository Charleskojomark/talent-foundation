import { createClient } from "@/lib/supabase/server";
import { RegistrationsClient } from "../registrations/RegistrationsClient";

export const dynamic = "force-dynamic";

export default async function ContestantsPage() {
    const supabase = await createClient();

    const { data: contestants, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("status", "verified")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load contestants: {error.message}
                </div>
            </div>
        );
    }

    return <RegistrationsClient initialData={contestants || []} isContestantsOnly={true} />;
}
