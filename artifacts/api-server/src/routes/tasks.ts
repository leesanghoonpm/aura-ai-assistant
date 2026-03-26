import { Router, type IRouter } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTaskBody, UpdateTaskBody, UpdateTaskParams, DeleteTaskParams, GetTasksQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tasks", async (req, res) => {
  try {
    const query = GetTasksQueryParams.parse(req.query);
    let tasks;
    if (query.status) {
      tasks = await db.select().from(tasksTable).where(eq(tasksTable.status, query.status));
    } else {
      tasks = await db.select().from(tasksTable);
    }
    res.json(tasks.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get tasks");
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const input = CreateTaskBody.parse(req.body);
    const [task] = await db.insert(tasksTable).values({
      title: input.title,
      description: input.description ?? undefined,
      priority: input.priority,
      dueDate: input.dueDate ?? undefined,
      category: input.category ?? undefined,
    }).returning();
    res.status(201).json({
      ...task,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create task");
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = UpdateTaskParams.parse(req.params);
    const input = UpdateTaskBody.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
    if (input.category !== undefined) updateData.category = input.category;

    const [task] = await db.update(tasksTable).set(updateData).where(eq(tasksTable.id, id)).returning();
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({
      ...task,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update task");
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = DeleteTaskParams.parse(req.params);
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete task");
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
