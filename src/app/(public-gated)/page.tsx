// app/(public-gated)/page.tsx
import Signin from "./UI";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const title = typeof sp.title === "string" ? sp.title : "Sign in";
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return <Signin title={title} next={next} />;
}