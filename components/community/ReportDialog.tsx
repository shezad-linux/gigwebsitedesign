"use client";

/* ==============================================================================
   ReportDialog Component
   Modal for reporting posts or replies
   ============================================================================== */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle, X } from "lucide-react";
import { submitReportAction } from "@/app/actions/community";
import { ReportInput } from "@/lib/community/types";

interface ReportDialogProps {
  targetType: "post" | "reply";
  targetId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam", description: "Unwanted promotional content or repetitive posts" },
  { value: "scam", label: "Scam", description: "Fraudulent offers, fake payment proofs, or deceptive schemes" },
  { value: "misleading", label: "Misleading", description: "False claims about earnings, guarantees, or platform features" },
  { value: "abuse", label: "Abuse", description: "Harassment, hate speech, or personal attacks" },
  { value: "other", label: "Other", description: "Other violation of community rules" },
] as const;

export const ReportDialog: React.FC<ReportDialogProps> = ({ targetType, targetId, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportInput>({
    defaultValues: {
      reason: "other",
      details: "",
    },
  });

  // Set the target ID based on type
  if (targetType === "post") {
    setValue("post_id", targetId, { shouldValidate: true });
  } else {
    setValue("reply_id", targetId, { shouldValidate: true });
  }

  const onSubmit = async (data: ReportInput) => {
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append("reason", data.reason);
    if (data.details) formData.append("details", data.details);
    if (data.post_id) formData.append("post_id", data.post_id);
    if (data.reply_id) formData.append("reply_id", data.reply_id);

    try {
      const result = await submitReportAction(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to submit report");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-ink">Report Content</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-ink hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close report dialog"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4" noValidate>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Target Info */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-600">
              Reporting <strong className="text-ink">{targetType}</strong> (ID: {targetId.slice(0, 8)}...)
            </p>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              {...register("reason", { required: "Please select a reason" })}
              className={`w-full px-4 py-3 border rounded-xl text-ink bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                errors.reason ? "border-red-500" : "border-neutral-300"
              }`}
              aria-invalid={errors.reason ? "true" : "false"}
              disabled={isSubmitting}
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Reason Description */}
          {watch("reason") && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-600">
                {REPORT_REASONS.find((r) => r.value === watch("reason"))?.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-ink mb-2">
              Additional Details (optional)
            </label>
            <textarea
              {...register("details", {
                maxLength: { value: 2000, message: "Details must be at most 2,000 characters" },
              })}
              id="details"
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl text-ink bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-y ${
                errors.details ? "border-red-500" : "border-neutral-300"
              }`}
              placeholder="Provide any additional context or evidence..."
              aria-invalid={errors.details ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.details && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.details.message}
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-500 text-right">
              {watch("details")?.length || 0}/2,000 characters
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-300 text-ink font-medium rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};