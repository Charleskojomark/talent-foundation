import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendRegistrationConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const body = await req.json();

        // Very basic validation
        if (!body.fullName || !body.email || !body.category || !body.videoUrl || !body.receiptUrl) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        // Insert Record into Database
        const { error: dbError } = await supabase
            .from('registrations')
            .insert([
                {
                    full_name: body.fullName,
                    email: body.email.toLowerCase().trim(),
                    phone: body.phone,
                    dob: body.dob,
                    address: body.address,
                    category: body.category,
                    why_compete: body.whyCompete,
                    description: body.description,
                    holy_spirit_relation: body.holySpiritRelation,
                    five_year_vision: body.fiveYearVision,
                    video_url: body.videoUrl,
                    receipt_url: body.receiptUrl,
                }
            ]);

        if (dbError) throw new Error(`Database Insert Failed: ${dbError.message}`);

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
