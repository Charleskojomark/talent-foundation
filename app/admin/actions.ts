"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendSecondVideoEmail } from "@/lib/email";

export async function updatePaymentStatus(registrationId: string, status: "verified" | "rejected") {
    const supabase = createAdminClient();

    // 1. Fetch contestant details if we need to send an email
    let contestant = null;
    if (status === "verified") {
        const { data, error: fetchError } = await supabase
            .from("registrations")
            .select("full_name, email")
            .eq("id", registrationId)
            .single();

        if (fetchError) {
            console.error("Fetch contestant error:", fetchError);
        } else {
            contestant = data;
        }
    }

    const { error } = await supabase
        .from("registrations")
        .update({ payment_status: status, status: status }) // if payment verified, user is verified contestant broadly
        .eq("id", registrationId);

    if (error) {
        throw new Error(`Failed to update status: ${error.message}`);
    }

    // 2. Send Email Notification if verified
    if (status === "verified" && contestant) {
        console.log(`[updatePaymentStatus] Triggering email for ${contestant.email}`);
        try {
            const emailRes = await sendSecondVideoEmail(contestant.email, contestant.full_name);
            if (emailRes.success) {
                console.log(`[updatePaymentStatus] Email sent successfully to ${contestant.email}`);
            } else {
                console.error(`[updatePaymentStatus] Email failed:`, emailRes.error);
            }
        } catch (emailErr) {
            console.error("[updatePaymentStatus] Silent email error:", emailErr);
        }
    }

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/contestants");
    revalidatePath("/admin");
}

export async function addGalleryItem(url: string, type: "image" | "video", caption: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("gallery").insert([{ url, type, caption }]);
    if (error) throw new Error(`Failed to add item: ${error.message}`);
    revalidatePath("/admin/gallery");
    revalidatePath("/");
}

export async function toggleGalleryFeatured(id: string, is_featured: boolean) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("gallery").update({ is_featured }).eq("id", id);
    if (error) throw new Error(`Failed to update item: ${error.message}`);
    revalidatePath("/admin/gallery");
    revalidatePath("/");
}

export async function deleteGalleryItem(id: string) {
    const supabase = createAdminClient();

    // First get the URL to know which file to delete from storage
    const { data: item } = await supabase.from("gallery").select("url").eq("id", id).single();

    if (item?.url) {
        // Extract filename from URL (assuming standard Supabase storage URL)
        // URL format: .../storage/v1/object/public/gallery/filename.ext
        const fileName = item.url.split('/').pop();
        if (fileName) {
            await supabase.storage.from("gallery").remove([fileName]);
        }
    }

    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete item: ${error.message}`);

    revalidatePath("/admin/gallery");
    revalidatePath("/");
}

export async function addAnnouncement(title: string, content: string, type: "update" | "event" | "result") {
    const supabase = createAdminClient();
    const { error } = await supabase.from("announcements").insert([{ title, content, type }]);
    if (error) throw new Error(`Failed to add announcement: ${error.message}`);
    revalidatePath("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete announcement: ${error.message}`);
    revalidatePath("/admin/announcements");
}

export async function addJudge(name: string, bio: string, photo_url: string, social_links: any) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("judges").insert([{ name, bio, photo_url, social_links }]);
    if (error) throw new Error(`Failed to add judge: ${error.message}`);
    revalidatePath("/admin/judges");
}

export async function deleteJudge(id: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("judges").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete judge: ${error.message}`);
    revalidatePath("/admin/judges");
}

export async function blockUser(registrationId: string) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from("registrations")
        .update({ status: 'blocked' })
        .eq("id", registrationId);

    if (error) throw new Error(`Failed to block user: ${error.message}`);

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/contestants");
    revalidatePath("/admin");
}

export async function unblockUser(registrationId: string) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from("registrations")
        .update({ status: 'pending' }) // or whatever original status was
        .eq("id", registrationId);

    if (error) throw new Error(`Failed to unblock user: ${error.message}`);

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/contestants");
    revalidatePath("/admin");
}
