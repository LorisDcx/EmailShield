"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-xl border border-border/40",
          },
        }}
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
