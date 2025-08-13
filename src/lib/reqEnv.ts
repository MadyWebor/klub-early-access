// lib/reqEnv.ts
export function reqEnv(name: string) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env: ${name}`);
  return v;
}