// Simple in-memory rate limiter
// Dla produkcji: użyj Redis (Upstash)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // okno czasowe w ms
  maxRequests: number; // max requestów w oknie
}

// Domyślne limity per endpoint
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/transcribe": { windowMs: 60000, maxRequests: 5 }, // 5/min
  "/api/ai/chat": { windowMs: 60000, maxRequests: 30 }, // 30/min
  "/api/ai/tts": { windowMs: 60000, maxRequests: 10 }, // 10/min
  "/api/ai/presentation": { windowMs: 60000, maxRequests: 10 }, // 10/min
  "/api/ai/research": { windowMs: 60000, maxRequests: 60 }, // 60/min
  default: { windowMs: 60000, maxRequests: 100 }, // 100/min
};

export function checkRateLimit(
  identifier: string,
  endpoint: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Jeśli nie ma wpisu lub wygasł, reset
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return { allowed, remaining, resetAt: entry.resetAt };
}

// Cleanup starych wpisów (wywołuj okresowo)
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Uruchom cleanup co 5 minut
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
