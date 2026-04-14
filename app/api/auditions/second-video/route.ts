import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendSecondVideoConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { email, secondVideoUrl } = await req.json();

        if (!email || !secondVideoUrl) {
            return NextResponse.json({ error: "email and secondVideoUrl are required" }, { status: 400 });
        }

        try {
            // First, get the user's name to personalize the email
            let userFullName = "Applicant";
            const userQuery = await db.select({ fullName: registrations.fullName }).from(registrations).where(eq(registrations.email, email));
            if (userQuery.length > 0) {
                userFullName = userQuery[0].fullName;
            }

            await db.update(registrations).set({
                secondVideoUrl: secondVideoUrl,
                currentStage: 'second_video_pending'
            }).where(eq(registrations.email, email));

            // Send confirmation email
            try {
                await sendSecondVideoConfirmationEmail(email, userFullName);
            } catch (emailErr) {
                console.error("Failed to send second video confirmation email:", emailErr);
            }
        } catch (error: any) {
            throw new Error(`Failed to save second video: ${error.message}`);
        }

        return NextResponse.json({ success: true, message: "Second video submitted successfully!" });
    } catch (error: any) {
        console.error("Second Video Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
