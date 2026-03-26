# AURA — AI Personal Assistant

> AI 기반 스마트 개인 비서 서비스 | Full-stack Web Application

![AURA](https://img.shields.io/badge/AURA-AI%20Assistant-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql)

## 주요 기능

| 기능 | 설명 |
|------|------|
| 📊 **모닝 브리핑** | 날씨, 오늘의 일정, 최신 뉴스, AI 인사이트를 한눈에 |
| 📧 **스마트 메일** | AI 기반 메일 분류·요약·답장 초안 생성 |
| ✅ **칸반 보드** | 할일 카드를 To Do / In Progress / Done으로 관리 |
| 📰 **뉴스 허브** | 카테고리별 뉴스 탐색 및 AI 요약 |
| 🔔 **스마트 리마인더** | 반복 알림 및 우선순위 관리 |
| 💬 **AI 챗봇** | 자연어 질문으로 AURA와 대화 |

## 기술 스택

### Frontend
- **React 19** + **Vite 6** — 빠른 개발 환경
- **TypeScript** — 타입 안정성
- **Framer Motion** — 부드러운 애니메이션
- **Tailwind CSS** + **shadcn/ui** — Toss 앱 스타일 모노크롬 디자인
- **TanStack Query** — 서버 상태 관리
- **Orval** — OpenAPI 코드 자동 생성

### Backend
- **Express 5** — REST API 서버
- **PostgreSQL** + **Drizzle ORM** — 타입 안전한 DB 쿼리
- **OpenAPI 3.1** — API 명세 중심 개발

## 로컬 실행

### 사전 요구사항
- Node.js 20+
- pnpm 9+
- PostgreSQL

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정 (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/aura

# DB 마이그레이션 + 시드 데이터
pnpm --filter @workspace/scripts run seed

# 개발 서버 실행 (frontend + backend 동시에)
pnpm --filter @workspace/aura run dev          # Frontend: http://localhost:5173
pnpm --filter @workspace/api-server run dev    # Backend:  http://localhost:3000
```

## 프로젝트 구조

```
aura-ai-assistant/
├── artifacts/
│   ├── aura/              # React + Vite Frontend
│   └── api-server/        # Express Backend
├── lib/
│   ├── api-spec/          # OpenAPI 3.1 명세
│   ├── api-client-react/  # Orval 자동생성 클라이언트
│   ├── api-zod/           # Zod 스키마 자동생성
│   └── db/                # Drizzle ORM 스키마 + 설정
└── scripts/               # DB 시드, 유틸리티 스크립트
```

## 디자인 철학

**Toss 앱** 스타일에서 영감을 받아 설계된 모노크롬 UI:
- 흰색/근흰색 배경, 진한 차콜 텍스트
- 1px 미세한 보더, 넉넉한 화이트스페이스
- Framer Motion 기반 부드러운 마이크로 인터랙션
- 모바일 퍼스트 반응형 레이아웃

---

Built with ❤️ using the Replit AI Agent
