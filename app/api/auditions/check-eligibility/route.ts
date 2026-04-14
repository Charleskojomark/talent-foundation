import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
        const userQuery = await db.select().from(registrations).where(eq(registrations.email, email.toLowerCase().trim()));

        if (userQuery.length === 0) {
            return NextResponse.json({ error: "Email not found in registration records" }, { status: 404 });
        }

        const user = userQuery[0];

        if (user.paymentStatus !== "verified") {
            return NextResponse.json({ error: "Your payment has not been verified yet. Please wait for the admin to complete the verification." }, { status: 403 });
        }

        // Return current stage to make sure they aren't fully completed yet if we want, but letting them update video is fine.
        return NextResponse.json({ success: true, user: { currentStage: user.currentStage, fullName: user.fullName } });
    } catch (error: any) {
        console.error("Eligibility Check Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
