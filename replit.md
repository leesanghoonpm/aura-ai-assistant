# AURA — AI Personal Assistant

## Overview

AURA는 사용자의 하루를 지능적으로 관리해주는 AI 개인 비서 웹 서비스입니다. 모닝 브리핑, 스마트 메일 관리, 할일 칸반 보드, 뉴스 & 인사이트, 스마트 리마인더, AI 챗봇 인터페이스를 제공합니다.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/aura) — Toss-style minimal monochrome design with Framer Motion animations
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI**: Shadcn/ui + Tailwind CSS + Lucide React icons
- **Animations**: Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── aura/           # React + Vite frontend (previewPath: /)
│   └── api-server/     # Express API server
├── lib/
│   ├── api-spec/       # OpenAPI spec + Orval codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/        # Generated Zod schemas from OpenAPI
│   └── db/             # Drizzle ORM schema + DB connection
├── scripts/            # Utility scripts (seed data)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features (Phase 1 — MVP)

- **모닝 브리핑 (Dashboard)**: 날짜/인사, 날씨, 일정 수, 마감 태스크, 긴급 메일, AI 인사이트, 주요 뉴스 TOP 3
- **할일 관리 (Tasks)**: 칸반 보드 (To Do / In Progress / Done), 우선순위 배지, 새 태스크 추가
- **스마트 메일 (Mail)**: AI 우선순위 분류 (긴급/중요/참고), 3줄 요약, 답장 초안 생성 (공식/친근/간결)
- **뉴스 & 인사이트 (News)**: 카테고리 필터, AI 인사이트 배지, 읽기 시간
- **스마트 리마인더 (Reminders)**: 시간/장소/습관/인물 타입별 리마인더
- **AI 챗봇 (Chat)**: AURA AI 대화, 맥락 기반 응답, 빠른 액션 버튼

## Database Schema

- `tasks` — 할일 (status: todo/in_progress/done, priority: low/medium/high/urgent)
- `mail` — 이메일 (priority: urgent/important/reference/spam)
- `news` — 뉴스 (category, source, readTime, insight)
- `reminders` — 리마인더 (type: time/location/habit/person)
- `chat_messages` — 채팅 이력 (role: user/assistant)

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — OpenAPI → React Query hooks & Zod 생성
- `pnpm --filter @workspace/db run push` — DB 스키마 push
- `pnpm --filter @workspace/scripts run seed` — 시드 데이터 삽입
- `pnpm --filter @workspace/api-server run build` — API 서버 빌드
- `pnpm --filter @workspace/aura run dev` — 프론트엔드 개발 서버

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck

## API Routes

All routes are mounted at `/api`:
- `GET /api/briefing` — 오늘의 모닝 브리핑
- `GET/POST /api/tasks` — 할일 목록 / 생성
- `PATCH/DELETE /api/tasks/:id` — 할일 수정 / 삭제
- `GET /api/mail` — 메일 목록 (priority 필터)
- `POST /api/mail/:id/reply-draft` — 답장 초안 생성
- `GET /api/news` — 뉴스 (category 필터)
- `GET/POST /api/reminders` — 리마인더 목록 / 생성
- `GET /api/chat/history` — 채팅 이력
- `POST /api/chat` — AI 메시지 전송

## Design System

Toss-style minimal monochrome design:
- White backgrounds, near-white surfaces
- Dark charcoal/near-black for text and primary actions
- Medium gray for secondary elements
- Very subtle borders (1px)
- Generous whitespace
- Framer Motion for page transitions, card hover, count-up animations
- Lucide React icons throughout
