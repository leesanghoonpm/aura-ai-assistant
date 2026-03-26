import { Router, type IRouter } from "express";
import { db, remindersTable } from "@workspace/db";
import { CreateReminderBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reminders", async (req, res) => {
  try {
    const reminders = await db.select().from(remindersTable);
    res.json(reminders.map(r => ({
      ...r,
      scheduledAt: r.scheduledAt?.toISOString() ?? undefined,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get reminders");
    res.status(500).json({ error: "Failed to get reminders" });
  }
});

router.post("/reminders", async (req, res) => {
  try {
    const input = CreateReminderBody.parse(req.body);
    const [reminder] = await db.insert(remindersTable).values({
      title: input.title,
      type: input.type,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      repeatPattern: input.repeatPattern ?? undefined,
      relatedPerson: input.relatedPerson ?? undefined,
    }).returning();
    res.status(201).json({
      ...reminder,
      scheduledAt: reminder.scheduledAt?.toISOString() ?? undefined,
      createdAt: reminder.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create reminder");
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

export default router;
