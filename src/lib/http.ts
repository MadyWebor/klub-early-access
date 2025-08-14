// JSON-safe type
type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export function json<T extends JsonValue>(
  data: T,
  init?: number | ResponseInit
): Response {
  const resInit: ResponseInit =
    typeof init === "number" ? { status: init } : (init ?? {});

  const headers = new Headers(resInit.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), { ...resInit, headers });
}

export function toMessage(e: unknown, fallback = "Unexpected error") {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch {}
  return fallback;
}
