"use server";

import { db } from "@/lib/db";
import { registrations, gallery, announcements, judges } from "@/lib/db/schema";
import { eq, like, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSecondVideoEmail } from "@/lib/email";
import { deleteFromR2 } from "@/lib/storage";

export async function updatePaymentStatus(registrationId: string, status: "verified" | "rejected") {
    // 1. Fetch contestant details if we need to send an email
    let contestant = null;
    if (status === "verified") {
        const [data] = await db
            .select({ full_name: registrations.fullName, email: registrations.email })
            .from(registrations)
            .where(eq(registrations.id, registrationId));

        if (!data) {
            console.error("Fetch contestant error: Not found");
        } else {
            contestant = data;
        }
    }

    try {
        await db
            .update(registrations)
            .set({ paymentStatus: status, status: status }) // if payment verified, user is verified contestant broadly
            .where(eq(registrations.id, registrationId));
    } catch (error: any) {
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
    try {
        const [newItem] = await db.insert(gallery).values({ url, type, caption }).returning();
        revalidatePath("/admin/gallery");
        revalidatePath("/");
        return newItem;
    } catch (error: any) {
        throw new Error(`Failed to add item: ${error.message}`);
    }
}

export async function toggleGalleryFeatured(id: string, is_featured: boolean) {
    try {
        await db.update(gallery).set({ isFeatured: is_featured }).where(eq(gallery.id, id));
    } catch (error: any) {
        throw new Error(`Failed to update item: ${error.message}`);
    }
    revalidatePath("/admin/gallery");
    revalidatePath("/");
}

export async function deleteGalleryItem(id: string) {
    // First get the URL to know which file to delete from storage
    const [item] = await db.select({ url: gallery.url }).from(gallery).where(eq(gallery.id, id));

    if (item?.url) {
        // Extract filename from URL (R2 URL format or direct path)
        const fileName = item.url.split('/').pop();
        if (fileName) {
            try {
                await deleteFromR2(fileName);
            } catch (err: any) {
                console.error("Failed to delete file from R2:", err.message);
            }
        }
    }

    try {
        await db.delete(gallery).where(eq(gallery.id, id));
    } catch (error: any) {
        throw new Error(`Failed to delete item: ${error.message}`);
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/");
}

export async function addAnnouncement(title: string, content: string, type: "update" | "event" | "result") {
    try {
        await db.insert(announcements).values({ title, content, type });
    } catch (error: any) {
        throw new Error(`Failed to add announcement: ${error.message}`);
    }
    revalidatePath("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
    try {
        await db.delete(announcements).where(eq(announcements.id, id));
    } catch (error: any) {
        throw new Error(`Failed to delete announcement: ${error.message}`);
    }
    revalidatePath("/admin/announcements");
}

export async function addJudge(name: string, bio: string, photoUrl: string, socialLinks: any) {
    try {
        await db.insert(judges).values({ name, bio, photoUrl, socialLinks });
    } catch (error: any) {
        throw new Error(`Failed to add judge: ${error.message}`);
    }
    revalidatePath("/admin/judges");
}

export async function deleteJudge(id: string) {
    try {
        await db.delete(judges).where(eq(judges.id, id));
    } catch (error: any) {
        throw new Error(`Failed to delete judge: ${error.message}`);
    }
    revalidatePath("/admin/judges");
}

export async function blockUser(registrationId: string) {
    try {
        await db.update(registrations).set({ status: 'blocked' }).where(eq(registrations.id, registrationId));
    } catch (error: any) {
        throw new Error(`Failed to block user: ${error.message}`);
    }

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/contestants");
    revalidatePath("/admin");
}

// ============================================
// Live Audition Actions
// ============================================

export async function getContestant(id: string) {
    try {
        const [contestant] = await db.select().from(registrations).where(eq(registrations.id, id));
        return contestant || null;
    } catch (error: any) {
        throw new Error(`Failed to get contestant: ${error.message}`);
    }
}

export async function saveLiveAuditionScore(id: string, score: number) {
    try {
        await db.update(registrations).set({
            liveAuditionScore: score,
            currentStage: 'live_audition_completed'
        }).where(eq(registrations.id, id));
        revalidatePath("/admin/registrations");
    } catch (error: any) {
        throw new Error(`Failed to save score: ${error.message}`);
    }
}

export async function verifyLiveAuditionEmail(email: string) {
    try {
        const [contestant] = await db.select()
            .from(registrations)
            .where(like(registrations.email, email.trim()))
            .orderBy(desc(registrations.createdAt))
            .limit(1);

        if (!contestant) throw new Error("Contestant not found. Please ensure you are using the correct email.");
        if (contestant.currentStage !== 'live_audition_scheduled') throw new Error("You are not currently scheduled for a live audition.");

        return contestant;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function unblockUser(registrationId: string) {
    try {
        await db.update(registrations).set({ status: 'pending' }).where(eq(registrations.id, registrationId));
    } catch (error: any) {
        throw new Error(`Failed to unblock user: ${error.message}`);
    }

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/contestants");
    revalidatePath("/admin");
}
