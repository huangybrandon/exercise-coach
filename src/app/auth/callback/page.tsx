"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ error, data }) => {
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          router.replace("/");
          return;
        }
        setError("No session found after sign-in.");
      })
      .catch((err) => setError(err.message));
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">Sign-in failed</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="text-lg font-medium">Signing you in…</div>
    </div>
  );
}
