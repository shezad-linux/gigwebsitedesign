"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telemetry } from "@/lib/telemetry";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Privacy-conscious telemetry with automatic PII sanitization
    telemetry.captureException(error, {
      route: "app/error",
      metadata: { digest: error?.digest },
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-neutral-300 rounded-3xl p-8 shadow-xs text-center space-y-6">
        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-black tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            An unexpected error occurred while rendering this page. Your saved data and application tracker remain secure.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-neutral-400 bg-neutral-100 py-1 px-2 rounded-md">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Matching Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
