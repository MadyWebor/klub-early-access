// src/lib/handles.ts
import { prisma } from "@/lib/db";
import { RESERVED_HANDLES, normalizeHandle } from "@/lib/validators/profile";

/** Returns a unique, non-reserved handle; appends numeric suffixes if necessary. */
export async function ensureUniqueHandle(candidate: string, userIdToExclude?: string) {
  let h = normalizeHandle(candidate);

  // Block reserved handles
  if (RESERVED_HANDLES.has(h)) h = `${h}1`;

  // Check conflict against other users (case-insensitive)
  const conflict = async (val: string) => {
    const hit = await prisma.user.findFirst({
      where: {
        handle: { equals: val, mode: "insensitive" },
        ...(userIdToExclude ? { NOT: { id: userIdToExclude } } : {}),
      },
      select: { id: true },
    });
    return !!hit;
  };

  if (!(await conflict(h))) return h;

  // Try -1, -2, ... -99
  for (let i = 1; i < 100; i++) {
    const tryH = (h + i).slice(0, 30);
    if (!(await conflict(tryH))) return tryH;
  }
  // Last resort: random suffix
  return `${h.substring(0, 26)}${Math.floor(Math.random() * 10000)}`;
}
