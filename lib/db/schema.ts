import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const judges = sqliteTable("judges", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    name: text("name").notNull(),
    bio: text("bio").notNull(),
    photoUrl: text("photo_url"),
    socialLinks: text("social_links", { mode: 'json' }).default('{}'), // SQLite stores json as text
});

export const registrations = sqliteTable("registrations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    dob: text("dob").notNull(), // standard date 
    address: text("address").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    whyCompete: text("why_compete").notNull(),
    holySpiritRelation: text("holy_spirit_relation").notNull(),
    fiveYearVision: text("five_year_vision").notNull(),
    videoUrl: text("video_url"),
    receiptUrl: text("receipt_url"),
    secondVideoUrl: text("second_video_url"),
    status: text("status").default('pending'),
    paymentStatus: text("payment_status").default('pending'),
    currentStage: text("current_stage").default('registration'),
    liveAuditionSong: text("live_audition_song"),
    liveAuditionTime: text("live_audition_time"),
    liveAuditionScore: integer("live_audition_score").default(0),
    liveAuditionRoomId: text("live_audition_room_id"),
    judgeId: text("judge_id").references(() => judges.id),
});

export const gallery = sqliteTable("gallery", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    type: text("type").notNull(), // 'image' or 'video'
    url: text("url").notNull(),
    caption: text("caption"),
    isFeatured: integer("is_featured", { mode: 'boolean' }).default(false), // SQLite booleans are 0/1 integers
});

export const announcements = sqliteTable("announcements", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    type: text("type").default('update'), // 'update', 'event', 'result'
});

export const tickets = sqliteTable("tickets", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    ticketType: text("ticket_type").notNull(), // 'Regular: 5000', 'VIP: 20000', etc.
    receiptUrl: text("receipt_url").notNull(),
    paymentStatus: text("payment_status").default("pending").notNull(),
});
