import { db, tasksTable, mailTable, newsTable, remindersTable, chatMessagesTable } from "@workspace/db";

async function seed() {
  console.log("Seeding AURA database...");

  await db.delete(chatMessagesTable);
  await db.delete(remindersTable);
  await db.delete(newsTable);
  await db.delete(mailTable);
  await db.delete(tasksTable);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  await db.insert(tasksTable).values([
    {
      title: "Q2 기획서 작성",
      description: "2분기 제품 로드맵 기획서를 팀장에게 제출",
      status: "in_progress",
      priority: "urgent",
      dueDate: todayStr,
      category: "업무",
    },
    {
      title: "디자인 시스템 리뷰",
      description: "새 컴포넌트 디자인 검토 및 피드백",
      status: "todo",
      priority: "high",
      dueDate: todayStr,
      category: "디자인",
    },
    {
      title: "주간 팀 미팅 준비",
      description: "이번 주 진행 사항 정리 및 발표 자료 준비",
      status: "todo",
      priority: "medium",
      dueDate: tomorrowStr,
      category: "미팅",
    },
    {
      title: "코드 리뷰",
      description: "PR #142 코드 리뷰 완료",
      status: "done",
      priority: "medium",
      dueDate: yesterdayStr,
      category: "개발",
    },
    {
      title: "사용자 인터뷰 일정 잡기",
      description: "베타 사용자 5명 인터뷰 스케줄 확정",
      status: "todo",
      priority: "high",
      dueDate: tomorrowStr,
      category: "리서치",
    },
    {
      title: "월간 소비 리포트 검토",
      description: "지난달 지출 패턴 분석 및 예산 조정",
      status: "todo",
      priority: "low",
      dueDate: tomorrowStr,
      category: "재무",
    },
    {
      title: "운동 루틴 계획 세우기",
      description: "주 3회 헬스장 스케줄 확정",
      status: "done",
      priority: "medium",
      category: "건강",
    },
    {
      title: "신규 파트너사 미팅 준비",
      description: "파트너십 제안서 검토 및 협상 포인트 정리",
      status: "in_progress",
      priority: "high",
      dueDate: tomorrowStr,
      category: "비즈니스",
    },
  ]);

  await db.insert(mailTable).values([
    {
      sender: "김민준 팀장",
      senderEmail: "minjun.kim@company.com",
      subject: "[긴급] Q2 기획서 오늘까지 제출 부탁드립니다",
      preview: "안녕하세요, 오늘 오후 5시까지 Q2 기획서 제출 부탁드립니다. 경영진 보고가 내일 있어서...",
      summary: "Q2 기획서를 오늘 오후 5시까지 제출 요청. 내일 경영진 보고 예정. 포함 내용: 시장 분석, 목표 KPI, 실행 계획.",
      priority: "urgent",
      isRead: false,
      hasFollowUp: true,
    },
    {
      sender: "이서연 디자이너",
      senderEmail: "seoyeon.lee@company.com",
      subject: "디자인 시스템 v2.0 업데이트 공유",
      preview: "안녕하세요! 디자인 시스템 v2.0 업데이트가 완료되었습니다. 주요 변경 사항을 공유드립니다...",
      summary: "디자인 시스템 v2.0 업데이트 완료. 신규 컴포넌트 15개 추가, 색상 팔레트 개선, 모바일 대응 강화. 리뷰 요청.",
      priority: "important",
      isRead: false,
      hasFollowUp: true,
    },
    {
      sender: "박지우 개발자",
      senderEmail: "jiwoo.park@company.com",
      subject: "PR #142 리뷰 요청드립니다",
      preview: "안녕하세요, 로그인 플로우 개선 관련 PR을 올렸습니다. 리뷰 부탁드립니다...",
      summary: "PR #142 로그인 플로우 개선 작업. 소셜 로그인 추가, 에러 핸들링 개선, 단위 테스트 추가. 2-3일 내 머지 희망.",
      priority: "important",
      isRead: true,
      hasFollowUp: false,
    },
    {
      sender: "Google Analytics",
      senderEmail: "noreply@google.com",
      subject: "월간 웹사이트 리포트 - 3월",
      preview: "이번 달 웹사이트 트래픽이 전월 대비 23% 증가했습니다...",
      summary: "3월 웹사이트 트래픽 전월 대비 23% 증가. 신규 방문자 45% 증가, 평균 세션 시간 2분 30초, 이탈률 35%.",
      priority: "reference",
      isRead: true,
      hasFollowUp: false,
    },
    {
      sender: "최현우 CTO",
      senderEmail: "hyunwoo.choi@company.com",
      subject: "기술 스택 검토 회의 일정",
      preview: "다음 주 목요일 오후 3시에 기술 스택 검토 회의 하면 어떨까요?",
      summary: "다음 주 목요일 오후 3시 기술 스택 검토 회의 제안. 마이크로서비스 전환, 클라우드 비용 최적화, 보안 강화 방안 논의 예정.",
      priority: "important",
      isRead: false,
      hasFollowUp: true,
    },
    {
      sender: "뉴스레터 AI Weekly",
      senderEmail: "newsletter@aiweekly.com",
      subject: "AI Weekly - GPT-5 발표, 오픈소스 LLM 혁신",
      preview: "이번 주 AI 뉴스: OpenAI GPT-5 발표, Mistral 신모델 출시, AI 규제 법안 통과...",
      summary: "이번 주 주요 AI 뉴스 요약: GPT-5 출시로 추론 능력 대폭 향상, Mistral 7B v2 오픈소스 공개, EU AI Act 최종 통과.",
      priority: "reference",
      isRead: false,
      hasFollowUp: false,
    },
  ]);

  await db.insert(newsTable).values([
    {
      title: "AI 스타트업 투자 열풍, 1분기 역대 최고치 기록",
      summary: "글로벌 AI 스타트업 투자가 2026년 1분기에 역대 최고치를 기록했습니다. 총 투자액은 전년 동기 대비 180% 증가한 850억 달러에 달하며, 특히 생성형 AI와 에이전트 AI 분야에 집중되고 있습니다.",
      category: "AI/테크",
      source: "테크크런치",
      readTime: 3,
      insight: "AI 에이전트 분야 투자 증가는 AURA 같은 서비스의 성장 가능성을 시사합니다.",
    },
    {
      title: "한국 경제 성장률 2.8% 달성, 수출 호조 지속",
      summary: "한국 경제가 올해 1분기 2.8% 성장률을 기록하며 예상치를 상회했습니다. 반도체와 자동차 수출이 회복세를 주도하고 있으며, 내수 소비도 점진적으로 개선되고 있는 것으로 나타났습니다.",
      category: "경제",
      source: "한국경제",
      readTime: 2,
      insight: "경제 회복세가 이어지면 소비 심리 개선으로 이어져 서비스업에 긍정적 영향을 줄 수 있어요.",
    },
    {
      title: "서울 아파트 거래량 3개월 연속 증가",
      summary: "서울 아파트 거래량이 3개월 연속 증가세를 보이고 있습니다. 금리 인하 기대감과 함께 실수요자 중심의 거래가 늘어나고 있으며, 주요 지역 호가도 소폭 상승하는 추세입니다.",
      category: "부동산",
      source: "부동산114",
      readTime: 3,
      insight: "부동산 시장 회복은 소비 심리에 긍정적인 영향을 줄 수 있습니다.",
    },
    {
      title: "국내 전기차 판매량 전년比 45% 급증",
      summary: "올해 1분기 국내 전기차 판매량이 전년 동기 대비 45% 급증했습니다. 정부 보조금 확대와 충전 인프라 개선이 주요 원인으로 분석되며, 현대차와 기아의 신모델이 판매를 주도하고 있습니다.",
      category: "모빌리티",
      source: "오토타임즈",
      readTime: 2,
    },
    {
      title: "삼성전자, AI 반도체 '가우스2' 4분기 양산 개시",
      summary: "삼성전자가 온디바이스 AI 전용 반도체 '가우스2'의 4분기 양산을 공식 발표했습니다. HBM4 메모리와 결합해 추론 성능을 전 세대 대비 3배 향상시킨 것이 특징입니다.",
      category: "AI/테크",
      source: "디지털타임스",
      readTime: 3,
      insight: "국내 AI 반도체 기술 발전은 온디바이스 AI 서비스 확산을 앞당길 것으로 보입니다.",
    },
    {
      title: "카카오뱅크, AI 기반 개인화 금융 서비스 출시",
      summary: "카카오뱅크가 사용자 소비 패턴을 학습해 맞춤형 금융 솔루션을 제안하는 AI 기반 서비스를 출시했습니다. 자산 관리부터 대출 추천, 투자 포트폴리오 조언까지 원스톱으로 제공합니다.",
      category: "핀테크",
      source: "파이낸셜뉴스",
      readTime: 2,
      insight: "AI 개인화 금융 서비스 확산은 AURA 재무 관리 기능과 연계 시너지 가능성이 있어요.",
    },
  ]);

  await db.insert(remindersTable).values([
    {
      title: "비타민 복용",
      type: "habit",
      repeatPattern: "daily",
    },
    {
      title: "어머니 안부 전화",
      type: "person",
      relatedPerson: "어머니",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "헬스장 운동",
      type: "habit",
      repeatPattern: "mon,wed,fri",
    },
    {
      title: "팀 미팅",
      type: "time",
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "마트에서 우유 사기",
      type: "location",
    },
    {
      title: "박지우 생일 축하",
      type: "person",
      relatedPerson: "박지우",
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  await db.insert(chatMessagesTable).values([
    {
      role: "assistant",
      message: "안녕하세요! 저는 AURA예요. 오늘 하루를 더 스마트하게 만들어드릴게요. 무엇을 도와드릴까요? 😊",
    },
  ]);

  console.log("✅ Seeding complete!");
}

seed().catch(console.error);
