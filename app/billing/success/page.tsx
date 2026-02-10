import { Suspense } from "react";
import SuccessClient from "./success-client";

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Finalizing your subscription…</div>}>
      <SuccessClient />
    </Suspense>
  );
}
