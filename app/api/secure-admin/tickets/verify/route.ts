import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendTicketVerifiedEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Mark as verified
        await db.update(tickets).set({
            paymentStatus: "verified"
        }).where(eq(tickets.id, body.id));

        // Get ticket details to send email
        const ticketData = await db.select().from(tickets).where(eq(tickets.id, body.id));
        if (ticketData.length > 0) {
            const t = ticketData[0];
            await sendTicketVerifiedEmail(t.email, t.fullName, t.ticketType, t.id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Ticket Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
