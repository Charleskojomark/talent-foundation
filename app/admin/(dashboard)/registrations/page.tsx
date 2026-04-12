import { createClient } from "@/lib/supabase/server";
import { RegistrationsClient } from "./RegistrationsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const supabase = await createClient();

    const { data: registrations, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load registrations: {error.message}
                </div>
            </div>
        );
    }

    return <RegistrationsClient initialData={registrations || []} />;
}
