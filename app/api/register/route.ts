import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { sendRegistrationConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Insert Record into Database
        try {
            await db.insert(registrations).values({
                fullName: body.fullName,
                email: body.email.toLowerCase().trim(),
                phone: body.phone,
                dob: body.dob,
                address: body.address,
                category: body.category,
                whyCompete: body.whyCompete,
                description: body.description,
                holySpiritRelation: body.holySpiritRelation,
                fiveYearVision: body.fiveYearVision,
                videoUrl: body.videoUrl,
                receiptUrl: body.receiptUrl,
            });
        } catch (dbError: any) {
            throw new Error(`Database Insert Failed: ${dbError.message}`);
        }

        // Send Registration Confirmation Email
        try {
            await sendRegistrationConfirmationEmail(body.email, body.fullName);
        } catch (emailError) {
            console.error("Failed to send registration email:", emailError);
            // We don't throw here to avoid failing the whole registration if only email fails
        }

        return NextResponse.json({ success: true, message: "Registration successful!" });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { error: error.message || "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
