import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function safeGetSession() {
  try {
    return await getServerSession(authOptions);
  } catch (e) {
    console.error("getServerSession failed:", e);
    return null; // behave as "no session" instead of crashing
  }
}