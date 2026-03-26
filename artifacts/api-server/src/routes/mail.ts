import { Router, type IRouter } from "express";
import { db, mailTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetMailsQueryParams, GenerateReplyDraftParams, GenerateReplyDraftBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/mail", async (req, res) => {
  try {
    const query = GetMailsQueryParams.parse(req.query);
    let mails;
    if (query.priority) {
      mails = await db.select().from(mailTable).where(eq(mailTable.priority, query.priority));
    } else {
      mails = await db.select().from(mailTable);
    }
    res.json(mails.map(m => ({
      ...m,
      receivedAt: m.receivedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get mail");
    res.status(500).json({ error: "Failed to get mail" });
  }
});

router.post("/mail/:id/reply-draft", async (req, res) => {
  try {
    const { id } = GenerateReplyDraftParams.parse(req.params);
    const { tone } = GenerateReplyDraftBody.parse(req.body);

    const [mail] = await db.select().from(mailTable).where(eq(mailTable.id, id));
    if (!mail) return res.status(404).json({ error: "Mail not found" });

    const drafts: Record<string, string> = {
      formal: `안녕하세요,\n\n${mail.subject}에 대해 회신드립니다.\n\n말씀하신 내용을 검토한 후 빠른 시일 내에 답변드리겠습니다. 추가로 궁금하신 사항이 있으시면 언제든지 연락 주십시오.\n\n감사합니다.\n\n[서명]`,
      friendly: `안녕하세요!\n\n메일 감사해요. ${mail.subject} 관련해서 확인해봤는데요, 곧 자세히 답변드릴게요!\n\n궁금한 점 있으시면 편하게 연락해주세요 :)\n\n감사해요!`,
      brief: `확인했습니다. 검토 후 회신드리겠습니다. 감사합니다.`,
    };

    res.json({
      subject: `Re: ${mail.subject}`,
      body: drafts[tone] ?? drafts.formal,
      tone,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate reply draft");
    res.status(500).json({ error: "Failed to generate reply draft" });
  }
});

export default router;
