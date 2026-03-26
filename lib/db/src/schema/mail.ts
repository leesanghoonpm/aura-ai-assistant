import { pgTable, serial, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mailPriorityEnum = pgEnum("mail_priority", ["urgent", "important", "reference", "spam"]);

export const mailTable = pgTable("mail", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject").notNull(),
  preview: text("preview").notNull(),
  summary: text("summary").notNull(),
  priority: mailPriorityEnum("priority").notNull().default("reference"),
  isRead: boolean("is_read").notNull().default(false),
  hasFollowUp: boolean("has_follow_up").notNull().default(false),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export const insertMailSchema = createInsertSchema(mailTable).omit({ id: true, receivedAt: true });
export type InsertMail = z.infer<typeof insertMailSchema>;
export type Mail = typeof mailTable.$inferSelect;
