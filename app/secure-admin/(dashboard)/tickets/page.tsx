import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import TicketsClient from "../../components/TicketsClient";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
    const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    return <TicketsClient initialData={allTickets} />;
}
