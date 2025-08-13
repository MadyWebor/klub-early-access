// app/auth/error/page.tsx  (server component)
export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errParam = sp.error;
  const err = Array.isArray(errParam) ? errParam[0] : errParam;

  const messages: Record<string, string> = {
    OAuthAccountNotLinked:
      "That email is already linked to another sign-in method.",
    AccessDenied: "Access denied.",
    Configuration: "Auth misconfiguration. Contact support.",
    Verification: "Email verification failed or expired.",
  };

  return <p>{(err && messages[err]) || "Something went wrong."}</p>;
}