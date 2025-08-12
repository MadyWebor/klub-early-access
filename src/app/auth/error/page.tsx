export default function AuthError({ searchParams }: { searchParams: { error?: string } }) {
  const map: Record<string, string> = {
    OAuthAccountNotLinked: "That email is already linked to another sign-in method.",
    AccessDenied: "Access denied.",
    Configuration: "Auth misconfiguration. Contact support.",
    Verification: "Email verification failed or expired.",
  };
  return <p>{map[searchParams.error ?? ""] ?? "Something went wrong."}</p>;
}