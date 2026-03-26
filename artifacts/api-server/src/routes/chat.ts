import { Router, type IRouter } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { SendChatMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

const auraResponses: Record<string, { message: string; actions: { label: string; action: string }[] }> = {
  default: {
    message: "알겠어요! 더 도움이 필요하신 게 있으신가요? 오늘의 일정이나 메일, 할일 등 무엇이든 물어보세요.",
    actions: [
      { label: "오늘 브리핑", action: "briefing" },
      { label: "메일 확인", action: "mail" },
      { label: "할일 보기", action: "tasks" },
    ],
  },
};

function generateAuraResponse(message: string): { message: string; actions: { label: string; action: string }[] } {
  const lower = message.toLowerCase();
  
  if (lower.includes("일정") || lower.includes("브리핑")) {
    return {
      message: "오늘 일정을 확인해드릴게요! 현재 3개의 일정이 잡혀 있고, 오후 2시 팀 미팅이 가장 중요한 일정이에요. 준비 잘 하세요 😊",
      actions: [
        { label: "브리핑 상세 보기", action: "briefing" },
        { label: "할일 추가", action: "add-task" },
      ],
    };
  }
  
  if (lower.includes("메일") || lower.includes("이메일")) {
    return {
      message: "현재 긴급 메일 2통, 중요 메일 5통이 있어요. 김팀장님께서 보내신 프로젝트 검토 요청 메일이 가장 긴급해 보여요. 확인해볼까요?",
      actions: [
        { label: "긴급 메일 보기", action: "urgent-mail" },
        { label: "답장 초안 작성", action: "reply-draft" },
      ],
    };
  }
  
  if (lower.includes("할일") || lower.includes("태스크") || lower.includes("task")) {
    return {
      message: "오늘 마감인 태스크가 2개 있어요. '기획서 작성'과 '디자인 리뷰' 인데요, 우선순위를 고려하면 기획서부터 시작하는 게 좋을 것 같아요!",
      actions: [
        { label: "태스크 목록 보기", action: "tasks" },
        { label: "새 태스크 추가", action: "add-task" },
      ],
    };
  }
  
  if (lower.includes("뉴스") || lower.includes("소식")) {
    return {
      message: "오늘 주요 뉴스를 정리해드릴게요. AI 산업 성장, 경제 지표 개선, 기술 트렌드 등 흥미로운 소식들이 있어요. 어떤 분야가 가장 관심 있으세요?",
      actions: [
        { label: "뉴스 허브 보기", action: "news" },
        { label: "AI/테크 뉴스", action: "news-tech" },
      ],
    };
  }
  
  if (lower.includes("리마인더") || lower.includes("알림")) {
    return {
      message: "리마인더를 설정해드릴까요? 시간, 장소, 습관, 사람 기반 리마인더 중 어떤 종류로 설정하실 건가요?",
      actions: [
        { label: "리마인더 목록", action: "reminders" },
        { label: "새 리마인더 추가", action: "add-reminder" },
      ],
    };
  }
  
  if (lower.includes("안녕") || lower.includes("hello") || lower.includes("hi")) {
    return {
      message: "안녕하세요! 저는 AURA예요. 오늘 하루를 더 스마트하게 만들어드릴게요. 무엇을 도와드릴까요? 😊",
      actions: [
        { label: "오늘 브리핑", action: "briefing" },
        { label: "할일 확인", action: "tasks" },
        { label: "뉴스 보기", action: "news" },
      ],
    };
  }
  
  return auraResponses.default;
}

router.get("/chat/history", async (req, res) => {
  try {
    const messages = await db.select().from(chatMessagesTable);
    res.json(messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get chat history");
    res.status(500).json({ error: "Failed to get chat history" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = SendChatMessageBody.parse(req.body);
    
    await db.insert(chatMessagesTable).values({ role: "user", message });
    
    const response = generateAuraResponse(message);
    
    const [aiMessage] = await db.insert(chatMessagesTable).values({
      role: "assistant",
      message: response.message,
    }).returning();
    
    res.json({
      id: aiMessage.id,
      message: response.message,
      actions: response.actions,
      createdAt: aiMessage.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send chat message");
    res.status(500).json({ error: "Failed to send chat message" });
  }
});

export default router;
