import { Router, type IRouter } from "express";
import { db, newsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetNewsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/news", async (req, res) => {
  try {
    const query = GetNewsQueryParams.parse(req.query);
    let news;
    if (query.category) {
      news = await db.select().from(newsTable).where(eq(newsTable.category, query.category));
    } else {
      news = await db.select().from(newsTable);
    }
    res.json(news.map(n => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get news");
    res.status(500).json({ error: "Failed to get news" });
  }
});

export default router;
