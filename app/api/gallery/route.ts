import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gallery } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const items = await db.select().from(gallery).orderBy(desc(gallery.isFeatured), desc(gallery.createdAt));
        return NextResponse.json(items);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
