const rateLimitMap = new Map<string, { count: number; last: number }>();
const WINDOW = 60 * 1000; // 1 minute
const LIMIT = 5;

export function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, last: now };
  if (now - entry.last > WINDOW) {
    entry.count = 0;
    entry.last = now;
  }
  entry.count += 1;
  rateLimitMap.set(key, entry);
  if (entry.count > LIMIT) throw new Error('Too many requests, please try again later.');
} 