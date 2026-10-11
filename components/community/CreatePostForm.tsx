"use client";

/* ==============================================================================
   CreatePostForm Component
   Form for creating new community posts with validation
   ============================================================================== */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Link as LinkIcon, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { createPostAction } from "@/app/actions/community";
import { CreatePostInput } from "@/lib/community/types";

export const CreatePostForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreatePostInput>({
    defaultValues: {
      title: "",
      body: "",
      link_url: "",
      affiliate_disclosure: "",
    },
  });

  const linkUrl = watch("link_url");
  const showDisclosure = linkUrl && linkUrl.trim() !== "";

  const onSubmit = async (data: CreatePostInput) => {
    setIsSubmitting(true);
    setError(null);
    setWarning(null);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("body", data.body);
    if (data.link_url) formData.append("link_url", data.link_url);
    if (data.affiliate_disclosure) formData.append("affiliate_disclosure", data.affiliate_disclosure);

    try {
      const result = await createPostAction(formData);
      if (result.success) {
        if (result.warning) {
          setWarning(result.warning);
          setTimeout(() => {
            window.location.href = "/community";
          }, 2500);
          return;
        }
        reset();
        window.location.href = "/community";
      } else {
        setError(result.error || "Failed to create post");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {warning && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>{warning}</div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title", {
            required: "Title is required",
            minLength: { value: 5, message: "Title must be at least 5 characters" },
            maxLength: { value: 160, message: "Title must be at most 160 characters" },
          })}
          id="title"
          type="text"
          className={`w-full px-4 py-3 border rounded-xl text-ink bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
            errors.title ? "border-red-500" : "border-neutral-300"
          }`}
          placeholder="What's your post about? (5-160 characters)"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p id="title-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.title.message}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500 text-right">
          {watch("title")?.length || 0}/160 characters
        </p>
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-ink mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("body", {
            required: "Content is required",
            minLength: { value: 1, message: "Content cannot be empty" },
            maxLength: { value: 10000, message: "Content must be at most 10,000 characters" },
          })}
          id="body"
          rows={10}
          className={`w-full px-4 py-3 border rounded-xl text-ink bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-y min-h-[150px] ${
            errors.body ? "border-red-500" : "border-neutral-300"
          }`}
          placeholder="Share your experience, ask a question, or start a discussion..."
          aria-invalid={errors.body ? "true" : "false"}
          aria-describedby={errors.body ? "body-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.body && (
          <p id="body-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.body.message}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500 text-right">
          {watch("body")?.length || 0}/10,000 characters
        </p>
      </div>

      {/* Optional Link */}
      <div>
        <label htmlFor="link_url" className="block text-sm font-medium text-ink mb-2">
          Resource URL (optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            {...register("link_url", {
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Must be a valid HTTP/HTTPS URL",
              },
            })}
            id="link_url"
            type="url"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl text-ink bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
              errors.link_url ? "border-red-500" : "border-neutral-300"
            }`}
            placeholder="https://example.com/resource"
            aria-invalid={errors.link_url ? "true" : "false"}
            aria-describedby={errors.link_url ? "link-error" : undefined}
            disabled={isSubmitting}
          />
        </div>
        {errors.link_url && (
          <p id="link-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.link_url.message}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Only HTTP/HTTPS URLs allowed. Localhost and private IPs are blocked.
        </p>
      </div>

      {/* Affiliate Disclosure */}
      {showDisclosure && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-2">
                Affiliate Disclosure Required
              </p>
              <p className="text-sm text-amber-800 mb-3">
                Since you've included a link, you must disclose any affiliate relationship.
              </p>
              <textarea
                {...register("affiliate_disclosure", {
                  maxLength: { value: 500, message: "Disclosure must be at most 500 characters" },
                })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-ink bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                  errors.affiliate_disclosure ? "border-red-500" : "border-amber-300"
                }`}
                placeholder="e.g., This post contains an affiliate link. Remotasks.si may earn a commission if you register through this link, at no additional cost to you."
                disabled={isSubmitting}
              />
              {errors.affiliate_disclosure && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.affiliate_disclosure.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Community Rules Reminder */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <h4 className="font-medium text-ink mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Community Rules
        </h4>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• No guaranteed-income claims without credible evidence</li>
          <li>• No fake payment proofs or fabricated reviews</li>
          <li>• No private information or credentials</li>
          <li>• No malicious URLs, phishing, or executable attachments</li>
          <li>• Disclose affiliate relationships clearly</li>
          <li>• Do not impersonate gig platforms or their support teams</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Post"
          )}
        </button>
      </div>
    </form>
  );
};