"use client";

import React, { useEffect } from "react";
import { telemetry } from "@/lib/telemetry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    telemetry.captureException(error, {
      route: "app/global-error",
      metadata: { digest: error?.digest },
    });
  }, [error]);
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-[#09090b] font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-[#e4e4e7] rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight">Application Encountered a Fatal Error</h1>
            <p className="text-xs text-[#71717a] leading-relaxed">
              A critical failure occurred. Please refresh the page or try again.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
