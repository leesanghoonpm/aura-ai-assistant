import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, mailTable, newsTable, remindersTable } from "@workspace/db";
import { eq, and, lte, not } from "drizzle-orm";

const router: IRouter = Router();

router.get("/briefing", async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tasksDueToday = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.dueDate, todayStr), not(eq(tasksTable.status, "done"))));

    const tasksOverdue = await db
      .select()
      .from(tasksTable)
      .where(and(lte(tasksTable.dueDate, todayStr), not(eq(tasksTable.status, "done"))));

    const urgentMail = await db
      .select()
      .from(mailTable)
      .where(and(eq(mailTable.priority, "urgent"), eq(mailTable.isRead, false)));

    const topNews = await db.select().from(newsTable).limit(3);

    const pendingFollowUps = await db
      .select()
      .from(mailTable)
      .where(eq(mailTable.hasFollowUp, true));

    const hour = today.getHours();
    let greeting = "안녕하세요";
    if (hour < 12) greeting = "좋은 아침이에요";
    else if (hour < 18) greeting = "오후도 화이팅이에요";
    else greeting = "오늘 하루 수고 많으셨어요";

    const insights = [
      "오늘 집중 시간을 2시간 확보하면 주요 태스크를 모두 완료할 수 있어요.",
      "미처리 메일이 있어요. 30분만 투자하면 클리어할 수 있어요.",
      "이번 주 생산성이 지난주보다 15% 높아졌어요. 잘 하고 있어요!",
      "오늘 마감 태스크가 있어요. 우선순위를 정해서 시작해보세요.",
    ];
    const insight = insights[Math.floor(Math.random() * insights.length)];

    const data = {
      date: today.toISOString(),
      greeting,
      weather: {
        temp: 14,
        condition: "맑음",
        recommendation: "오후부터 바람이 강해질 예정이에요. 겉옷을 챙기세요.",
      },
      scheduleCount: 3,
      tasksDueToday: tasksDueToday.length,
      tasksOverdue: tasksOverdue.length,
      urgentMailCount: urgentMail.length,
      topNews: topNews.map((n) => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        category: n.category,
        source: n.source,
        publishedAt: n.publishedAt.toISOString(),
        readTime: n.readTime,
        insight: n.insight ?? undefined,
      })),
      insight,
      pendingFollowUps: pendingFollowUps.length,
    };

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get briefing");
    res.status(500).json({ error: "Failed to get briefing" });
  }
});

export default router;
