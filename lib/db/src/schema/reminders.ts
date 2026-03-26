import { pgTable, serial, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reminderTypeEnum = pgEnum("reminder_type", ["time", "location", "habit", "person"]);

export const remindersTable = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: reminderTypeEnum("type").notNull().default("time"),
  scheduledAt: timestamp("scheduled_at"),
  isCompleted: boolean("is_completed").notNull().default(false),
  repeatPattern: text("repeat_pattern"),
  relatedPerson: text("related_person"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReminderSchema = createInsertSchema(remindersTable).omit({ id: true, createdAt: true });
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof remindersTable.$inferSelect;
