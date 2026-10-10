"use client";

/* ==============================================================================
   ModerationActions Component
   Dropdown menu for moderator actions on posts/replies
   ============================================================================== */

import React, { useState } from "react";
import { MoreVertical, Eye, EyeOff, Shield, Flag, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { moderatePostAction, moderateReplyAction, resolveReportAction } from "@/app/actions/community";

interface ModerationActionsProps {
  type: "post" | "reply" | "report";
  id: string;
  currentStatus?: "published" | "hidden" | "removed" | "open" | "reviewing" | "resolved" | "dismissed";
  onActionComplete: () => void;
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({
  type,
  id,
  currentStatus,
  onActionComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: string, reason?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (type === "post") {
        result = await moderatePostAction(id, action as "hide" | "restore", reason);
      } else if (type === "reply") {
        result = await moderateReplyAction(id, action as "hide" | "restore", reason);
      } else if (type === "report") {
        result = await resolveReportAction(id, action as "resolved" | "dismissed", reason);
      }

      if (result?.success) {
        setIsOpen(false);
        onActionComplete();
      } else {
        setError(result?.error || "Action failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (action: string, requiresReason = false) => {
    if (requiresReason) {
      const reason = prompt("Please provide a reason for this action (optional):");
      if (reason === null) return; // User cancelled
      handleAction(action, reason || undefined);
    } else {
      handleAction(action);
    }
  };

  if (type === "report") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-neutral-500 hover:text-ink hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Moderation actions"
          aria-expanded={isOpen}
        >
          <Shield className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="fixed right-4 z-50 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 animate-in zoom-in-95">
              {currentStatus === "open" || currentStatus === "reviewing" ? (
                <>
                  <button
                    onClick={() => handleConfirmAction("resolved", true)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleConfirmAction("dismissed", true)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Dismiss
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-neutral-500">
                  Report is {currentStatus}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  const isHidden = currentStatus === "hidden";
  const isRemoved = currentStatus === "removed";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-500 hover:text-ink hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Moderation actions"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed right-4 z-50 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 animate-in zoom-in-95">
            {type === "post" || type === "reply" ? (
              <>
                {!isHidden && !isRemoved ? (
                  <button
                    onClick={() => handleConfirmAction("hide", true)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50"
                  >
                    <EyeOff className="w-5 h-5" />
                    Hide Content
                  </button>
                ) : isHidden ? (
                  <button
                    onClick={() => handleConfirmAction("restore")}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <Eye className="w-5 h-5" />
                    Restore Content
                  </button>
                ) : (
                  <div className="px-3 py-2 text-sm text-neutral-500">Content removed</div>
                )}

                <hr className="my-1 border-neutral-200" />

                <button
                  onClick={() => handleConfirmAction("hide", true)}
                  disabled={isLoading || isRemoved}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Permanently
                </button>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};