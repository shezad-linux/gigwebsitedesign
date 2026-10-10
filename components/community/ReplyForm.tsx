"use client";

/* ==============================================================================
   ReplyForm Component
   Form for replying to a post
   ============================================================================== */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle } from "lucide-react";
import { createReplyAction } from "@/app/actions/community";
import { CreateReplyInput } from "@/lib/community/types";

interface ReplyFormProps {
  postId: string;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ postId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateReplyInput>({
    defaultValues: { body: "" },
  });

  const onSubmit = async (data: CreateReplyInput) => {
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append("body", data.body);

    try {
      const result = await createReplyAction(postId, formData);
      if (result.success) {
        reset();
        window.dispatchEvent(new Event("reply-created"));
      } else {
        setError(result.error || "Failed to post reply");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 pt-6 border-t border-neutral-200 space-y-4" noValidate>
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-ink">Write a Reply</h3>

      <div>
        <textarea
          {...register("body", {
            required: "Reply cannot be empty",
            minLength: { value: 1, message: "Reply cannot be empty" },
            maxLength: { value: 5000, message: "Reply must be at most 5,000 characters" },
          })}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl text-ink bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-y ${
            errors.body ? "border-red-500" : "border-neutral-300"
          }`}
          placeholder="Write your reply..."
          aria-invalid={errors.body ? "true" : "false"}
          aria-describedby={errors.body ? "reply-body-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.body && (
          <p id="reply-body-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.body.message}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500 text-right">
          {watch("body")?.length || 0}/5,000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Posting...
          </>
        ) : (
          "Post Reply"
        )}
      </button>
    </form>
  );
};