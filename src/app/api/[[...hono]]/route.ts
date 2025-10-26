import { handle } from 'hono/vercel';
import { createHonoApp } from '@/backend/hono/app';

// Lazy initialization: 런타임에만 Hono 앱 생성 (빌드 타임 환경 변수 검증 회피)
const getApp = () => createHonoApp();

export const GET = (req: Request) => handle(getApp())(req);
export const POST = (req: Request) => handle(getApp())(req);
export const PUT = (req: Request) => handle(getApp())(req);
export const PATCH = (req: Request) => handle(getApp())(req);
export const DELETE = (req: Request) => handle(getApp())(req);
export const OPTIONS = (req: Request) => handle(getApp())(req);

export const runtime = 'nodejs';
