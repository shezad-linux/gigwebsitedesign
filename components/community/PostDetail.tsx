"use client";

/* ==============================================================================
   PostDetail Component
   Displays full post with replies and reply form
   ============================================================================== */

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Flag, AlertTriangle, MoreVertical, Share2 } from "lucide-react";
import { CommunityPost, CommunityReply } from "@/lib/community/types";
import { ReplyList } from "./ReplyList";
import { ReplyForm } from "./ReplyForm";
import { ReportDialog } from "./ReportDialog";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface PostDetailProps {
  post: CommunityPost;
  replies: CommunityReply[];
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, replies }) => {
  const [showReportDialog, setShowReportDialog] = useState<{ type: "post" | "reply"; id: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: "post" | "reply"; id: string } | null>(null);
  const router = useRouter();

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const hasAffiliateLink = post.link_url && post.affiliate_disclosure;
  const isOwner = false; // Will be determined by server component

  const handleReport = (type: "post" | "reply", id: string) => {
    setShowReportDialog({ type, id });
  };

  const handleDelete = async (type: "post" | "reply", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const action = type === "post" 
        ? (await import("@/app/actions/community")).deletePostAction
        : (await import("@/app/actions/community")).deleteReplyAction;
      
      const result = await action(id);
      if (result.success) {
        if (type === "post") {
          router.push("/community");
        } else {
          router.refresh();
        }
      } else {
        alert(result.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete");
    }
  };

  return (
    <article className="space-y-6">
      {/* Post Header */}
      <header>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-ink">
              {post.author_name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-ink">{post.author_name || "Anonymous"}</span>
              {post.author_country && (
                <span className="text-xs text-neutral-500 px-2 py-0.5 bg-neutral-100 rounded-full">
                  {post.author_country}
                </span>
              )}
              {hasAffiliateLink && (
                <span className="text-xs text-neutral-600 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Affiliate Link
                </span>
              )}
            </div>
            <time className="text-xs text-neutral-500" dateTime={post.created_at}>
              {timeAgo}
            </time>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-ink mb-4">{post.title}</h1>
      </header>

      {/* Post Body */}
      <div className="prose prose-neutral max-w-none text-neutral-700 whitespace-pre-wrap">
        {post.body}
      </div>

      {/* Link & Disclosure */}
      {post.link_url && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 text-sm mb-2">
            <ExternalLink className="w-4 h-4 text-neutral-500" />
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline hover:text-neutral-700 font-mono text-xs truncate flex-1"
            >
              {post.link_url}
            </a>
            {hasAffiliateLink && (
              <span className="text-xs text-amber-700 px-2 py-0.5 bg-amber-100 rounded-full">
                Affiliate Link
              </span>
            )}
          </div>
          {post.affiliate_disclosure && (
            <p className="text-sm text-neutral-700 bg-white p-3 rounded border border-neutral-200">
              <strong className="text-ink">Disclosure:</strong> {post.affiliate_disclosure}
            </p>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
        <button
          onClick={() => handleReport("post", post.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-ink hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Flag className="w-4 h-4" />
          Report
        </button>
        <button
          onClick={() => setShowDeleteConfirm({ type: "post", id: post.id })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Replies Section */}
      <section className="pt-8 border-t border-neutral-200">
        <h2 className="text-xl font-semibold text-ink mb-4">
          Replies ({replies.length})
        </h2>

        <ReplyList
          replies={replies}
          postId={post.id}
          onReport={handleReport}
          onDelete={handleDelete}
        />

        <ReplyForm postId={post.id} />
      </section>

      {/* Report Dialog */}
      {showReportDialog && (
        <ReportDialog
          targetType={showReportDialog.type}
          targetId={showReportDialog.id}
          onClose={() => setShowReportDialog(null)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-ink mb-2">
              Delete {showDeleteConfirm.type}
            </h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to delete this {showDeleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-neutral-300 text-ink rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.type, showDeleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};