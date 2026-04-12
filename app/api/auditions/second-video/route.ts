import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { email, secondVideoUrl } = await req.json();

        if (!email || !secondVideoUrl) {
            return NextResponse.json({ error: "email and secondVideoUrl are required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("registrations")
            .update({
                second_video_url: secondVideoUrl,
                current_stage: 'second_video_pending'
            })
            .eq("email", email);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Second video submitted successfully!" });
    } catch (error: any) {
        console.error("Second Video Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
