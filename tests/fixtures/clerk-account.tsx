"use client";
export function useUser() {
  return {
    user: {
      id: "synthetic-user",
      fullName: "Ada Example",
      username: null,
      primaryEmailAddress: { emailAddress: "ada@example.invalid" },
      hasImage: false,
    },
  };
}
const getToken = async () => "synthetic-test-token";
export function useAuth() {
  return { getToken, sessionClaims: { aud: "convex" } };
}
export function UserProfile() {
  return (
    <div className="cl-rootBox">
      <h3>Profile settings fixture</h3>
      <p>Clerk provider settings render here in the real account route.</p>
    </div>
  );
}
