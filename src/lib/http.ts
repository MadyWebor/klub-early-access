export function json(data: any, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : (init as ResponseInit)?.status ?? 200;
  const headers = new Headers(typeof init === "number" ? undefined : (init as ResponseInit)?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...(typeof init === "number" ? { status: init } : (init as ResponseInit)), headers });
}

export function toMessage(e: unknown, fallback = "Unexpected error") {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch {}
  return fallback;
}
