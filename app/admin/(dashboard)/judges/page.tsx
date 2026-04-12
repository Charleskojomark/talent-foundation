import { createClient } from "@/lib/supabase/server";
import { JudgesClient } from "./JudgesClient";

export const dynamic = "force-dynamic";

export default async function JudgesPage() {
    const supabase = await createClient();

    const { data: judges, error } = await supabase
        .from("judges")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-red-400">
                    Failed to load judges: {error.message}
                </div>
            </div>
        );
    }

    return <JudgesClient initialData={judges || []} />;
}
