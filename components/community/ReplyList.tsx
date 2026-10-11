"use client";

/* ==============================================================================
   ReplyList Component
   Displays chronological list of replies
   ============================================================================== */

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Flag } from "lucide-react";
import { CommunityReply } from "@/lib/community/types";

interface ReplyListProps {
  replies: CommunityReply[];
  postId: string;
  onReport: (type: "post" | "reply", id: string) => void;
  onDelete: (type: "post" | "reply", id: string) => void;
  currentUserId?: string;
  isModerator?: boolean;
}

export const ReplyList: React.FC<ReplyListProps> = ({
  replies,
  onReport,
  onDelete,
  currentUserId,
  isModerator,
}) => {
  if (replies.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>No replies yet. Be the first to respond!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="feed" aria-label="Replies">
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          onReport={onReport}
          onDelete={onDelete}
          currentUserId={currentUserId}
          isModerator={isModerator}
        />
      ))}
    </div>
  );
};

interface ReplyItemProps {
  reply: CommunityReply;
  onReport: (type: "post" | "reply", id: string) => void;
  onDelete: (type: "post" | "reply", id: string) => void;
  currentUserId?: string;
  isModerator?: boolean;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  onReport,
  onDelete,
  currentUserId,
  isModerator,
}) => {
  const timeAgo = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true });
  const isOwner = !!(currentUserId && currentUserId === reply.author_id);
  const canDelete = isOwner || !!isModerator;

  return (
    <article className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-ink">
            {reply.author_name?.charAt(0).toUpperCase() || "A"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-ink">{reply.author_name || "Anonymous"}</span>
            {reply.author_country && (
              <span className="text-xs text-neutral-500 px-2 py-0.5 bg-neutral-100 rounded-full">
                {reply.author_country}
              </span>
            )}
            <time className="text-xs text-neutral-500" dateTime={reply.created_at}>
              {timeAgo}
            </time>
          </div>

          <div className="prose prose-neutral max-w-none text-neutral-700 whitespace-pre-wrap text-sm">
            {reply.body}
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
            <button
              onClick={() => onReport("reply", reply.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-ink hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              Report
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete("reply", reply.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};