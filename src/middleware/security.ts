import { NextRequest, NextResponse } from "next/server";

type RateLimitRule = {
  windowMs: number;
  max: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

const generalApiRule: RateLimitRule = {
  windowMs: 60_000,
  max: 120,
};

const sensitiveAuthRule: RateLimitRule = {
  windowMs: 60_000,
  max: 10,
};

const sensitiveAuthPaths = [
  "/api/auth/callback/credentials",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/change-password",
];

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "off",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const maxApiBodyBytes = 1_000_000;

const getClientIp = (req: NextRequest) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";

  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
};

const getRateLimitRule = (pathname: string) => {
  if (!pathname.startsWith("/api/")) return null;

  const isSensitiveAuthPath = sensitiveAuthPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  return isSensitiveAuthPath ? sensitiveAuthRule : generalApiRule;
};

const pruneExpiredRecords = (now: number) => {
  if (rateLimitStore.size < 1_000) return;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) rateLimitStore.delete(key);
  }
};

export function applySecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
}

export function rateLimitRequest(req: NextRequest) {
  const rule = getRateLimitRule(req.nextUrl.pathname);
  if (!rule) return null;

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxApiBodyBytes) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  const now = Date.now();
  const clientIp = getClientIp(req);
  const key = `${clientIp}:${req.nextUrl.pathname}`;
  const existing = rateLimitStore.get(key);

  pruneExpiredRecords(now);

  const record =
    existing && existing.resetAt > now
      ? { count: existing.count + 1, resetAt: existing.resetAt }
      : { count: 1, resetAt: now + rule.windowMs };

  rateLimitStore.set(key, record);

  if (record.count <= rule.max) return null;

  const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1_000);
  const response = NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  );
  response.headers.set("Retry-After", String(retryAfterSeconds));
  response.headers.set("X-RateLimit-Limit", String(rule.max));
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(record.resetAt / 1_000))
  );

  return response;
}
