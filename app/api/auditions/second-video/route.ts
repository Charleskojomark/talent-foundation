import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { email, secondVideoUrl } = await req.json();

        if (!email || !secondVideoUrl) {
            return NextResponse.json({ error: "email and secondVideoUrl are required" }, { status: 400 });
        }

        try {
            await db.update(registrations).set({
                secondVideoUrl: secondVideoUrl,
                currentStage: 'second_video_pending'
            }).where(eq(registrations.email, email));
        } catch (error: any) {
            throw new Error(`Failed to save second video: ${error.message}`);
        }

        return NextResponse.json({ success: true, message: "Second video submitted successfully!" });
    } catch (error: any) {
        console.error("Second Video Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
