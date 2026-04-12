import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const isAdmin = cookieStore.get("admin_session")?.value === "true";

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();
        const { id, nextStage, song, scheduledTime, roomId } = await req.json();

        if (!id || !nextStage) {
            return NextResponse.json({ error: "id and nextStage are required" }, { status: 400 });
        }

        if (nextStage === "live_audition_scheduled" && (!song || !scheduledTime)) {
            return NextResponse.json({ error: "song and scheduledTime are required for live audition" }, { status: 400 });
        }

        // 1. Fetch contestant details before updating
        const { data: contestant, error: fetchError } = await supabase
            .from("registrations")
            .select("full_name, email")
            .eq("id", id)
            .single();

        if (fetchError || !contestant) {
            console.error("Fetch Contestant Error:", fetchError);
            return NextResponse.json({ error: "Contestant not found" }, { status: 404 });
        }

        const updateData: any = {
            current_stage: nextStage,
        };

        if (song) updateData.live_audition_song = song;
        if (scheduledTime) updateData.live_audition_time = scheduledTime;
        if (roomId) updateData.live_audition_room_id = roomId;

        const { error: updateError } = await supabase
            .from("registrations")
            .update(updateData)
            .eq("id", id);

        if (updateError) throw updateError;

        // 2. Send Email Notification (Non-blocking)
        console.log(`[AdvanceStage] Triggering email for ${contestant.email} (Stage: ${nextStage})`);
        try {
            const { sendSecondVideoEmail, sendLiveAuditionScheduledEmail } = await import("@/lib/email");

            let emailRes;
            if (nextStage === "second_video_pending") {
                emailRes = await sendSecondVideoEmail(contestant.email, contestant.full_name);
            } else if (nextStage === "live_audition_scheduled") {
                emailRes = await sendLiveAuditionScheduledEmail(
                    contestant.email,
                    contestant.full_name,
                    song || "Assigned Song",
                    scheduledTime
                );
            }

            if (emailRes?.success) {
                console.log(`[AdvanceStage] Email sent successfully to ${contestant.email}`);
            } else {
                console.error(`[AdvanceStage] Email failed for ${contestant.email}:`, emailRes?.error);
            }
        } catch (emailErr) {
            console.error("Notification Error (Silent):", emailErr);
            // We don't fail the request if email fails, but we log it
        }

        return NextResponse.json({
            success: true,
            message: `Advanced to ${nextStage}`,
            notified: contestant.email
        });
    } catch (error: any) {
        console.error("Advance Stage Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
