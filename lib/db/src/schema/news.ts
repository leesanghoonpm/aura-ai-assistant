import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  source: text("source").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  readTime: integer("read_time").notNull().default(2),
  insight: text("insight"),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true, publishedAt: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;
