import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { sendTicketRequestConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        await db.insert(tickets).values({
            fullName: body.fullName,
            email: body.email,
            phone: body.phone,
            ticketType: body.ticketType,
            receiptUrl: body.receiptUrl,
            paymentStatus: "pending"
        });

        // Trigger Receipt Email confirmation
        await sendTicketRequestConfirmationEmail(body.email, body.fullName);

        return NextResponse.json({ success: true, message: "Ticket request created successfully" });
    } catch (error: any) {
        console.error("Ticket Creation API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process ticket" }, { status: 500 });
    }
}
