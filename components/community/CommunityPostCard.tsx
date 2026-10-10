"use client";

/* ==============================================================================
   CommunityPostCard Component
   Displays a post preview in the feed
   ============================================================================== */

import React from "react";
import Link from "next/link";
import { MessageSquare, ExternalLink, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/lib/community/types";

interface CommunityPostCardProps {
  post: CommunityPost;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post }) => {
  const excerpt = post.body.length > 200 ? post.body.slice(0, 200) + "..." : post.body;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const hasAffiliateLink = post.link_url && post.affiliate_disclosure;

  return (
    <article className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors">
      <Link href={`/community/${post.id}`} className="block">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-ink">
              {post.author_name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-ink truncate">{post.author_name || "Anonymous"}</span>
              {post.author_country && (
                <span className="text-xs text-neutral-500 px-2 py-0.5 bg-neutral-100 rounded-full">
                  {post.author_country}
                </span>
              )}
              {hasAffiliateLink && (
                <span className="text-xs text-neutral-600 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Affiliate
                </span>
              )}
            </div>
            <time className="text-xs text-neutral-500" dateTime={post.created_at}>
              {timeAgo}
            </time>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-ink mb-2 line-clamp-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-neutral-600 text-sm leading-relaxed mb-3 line-clamp-3">
          {excerpt}
        </p>

        {/* Link preview */}
        {post.link_url && (
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-neutral-700 truncate font-mono text-xs">
                {(() => {
                  try {
                    return new URL(post.link_url).hostname;
                  } catch {
                    return post.link_url;
                  }
                })()}
              </span>
              {hasAffiliateLink && (
                <span className="text-xs text-amber-700 px-2 py-0.5 bg-amber-100 rounded-full">
                  Affiliate Link
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
          <span className="flex items-center gap-1.5 text-sm text-neutral-500">
            <MessageSquare className="w-4 h-4" />
            {post.reply_count || 0} replies
          </span>
        </div>
      </Link>
    </article>
  );
};