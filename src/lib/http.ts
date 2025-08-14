export function json(data: any, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : (init as ResponseInit)?.status ?? 200;
  const headers = new Headers(typeof init === "number" ? undefined : (init as ResponseInit)?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...(typeof init === "number" ? { status: init } : (init as ResponseInit)), headers });
}
