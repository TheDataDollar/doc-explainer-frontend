import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
          Loading...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
