import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const isAdmin = cookieStore.get("admin_session")?.value === "true";

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id, nextStage, song, scheduledTime, roomId } = await req.json();

        if (!id || !nextStage) {
            return NextResponse.json({ error: "id and nextStage are required" }, { status: 400 });
        }

        if (nextStage === "live_audition_scheduled" && (!song || !scheduledTime)) {
            return NextResponse.json({ error: "song and scheduledTime are required for live audition" }, { status: 400 });
        }

        // 1. Fetch contestant details before updating
        const [contestant] = await db
            .select({ full_name: registrations.fullName, email: registrations.email })
            .from(registrations)
            .where(eq(registrations.id, id));

        if (!contestant) {
            console.error("Fetch Contestant Error: Not found");
            return NextResponse.json({ error: "Contestant not found" }, { status: 404 });
        }

        const updateData: any = {
            currentStage: nextStage,
        };

        if (song) updateData.liveAuditionSong = song;
        if (scheduledTime) updateData.liveAuditionTime = scheduledTime;
        if (roomId) updateData.liveAuditionRoomId = roomId;

        try {
            await db.update(registrations).set(updateData).where(eq(registrations.id, id));
        } catch (updateError: any) {
            throw new Error(`Update failed: ${updateError.message}`);
        }

        // 2. Send Email Notification (Non-blocking)
        console.log(`[AdvanceStage] Triggering email for ${contestant.email} (Stage: ${nextStage})`);
        try {
            const { sendSecondVideoEmail, sendLiveAuditionScheduledEmail } = await import("@/lib/email");

            let emailRes;
            if (nextStage === "second_video_pending") {
                emailRes = await sendSecondVideoEmail(contestant.email, contestant.full_name);
            } else if (nextStage === "live_audition_scheduled") {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://talent-foundation-z6p6.vercel.app";
                const liveRoomUrl = `${baseUrl}/auditions/live`;
                emailRes = await sendLiveAuditionScheduledEmail(
                    contestant.email,
                    contestant.full_name,
                    song || "Assigned Song",
                    scheduledTime,
                    liveRoomUrl
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
