"use client";

/* ==============================================================================
   CommunityFeed Component
   Renders paginated post cards with search and pagination
   ============================================================================== */

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CommunityPost } from "@/lib/community/types";
import { CommunityPostCard } from "./CommunityPostCard";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface CommunityFeedProps {
  initialPosts: CommunityPost[];
  pagination: Pagination;
  search: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  initialPosts,
  pagination,
  search,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    window.location.href = `/community?${params.toString()}`;
  };

  const loadMore = async () => {
    if (isLoading || !pagination.hasMore) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage + 1));
      params.set("limit", String(pagination.limit));
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const response = await fetch(`/api/community/feed?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setPosts((prev) => [...prev, ...data.data]);
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    window.location.href = `/community?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Search & Create */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 bg-white text-ink text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            aria-label="Search community posts"
          />
        </form>

        <Link
          href="/community/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 active:bg-neutral-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-ink mb-1">No posts yet</h3>
          <p className="text-neutral-500 text-sm">Be the first to start a discussion in the community.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4" role="feed" aria-label="Community posts">
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-sm text-neutral-500">
              Showing {posts.length} of {pagination.total} posts
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 border border-neutral-300 bg-white text-ink text-sm rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 text-sm font-medium text-ink">
                Page {currentPage}
              </span>

              <button
                onClick={loadMore}
                disabled={isLoading || !pagination.hasMore}
                className="p-2 border border-neutral-300 bg-white text-ink text-sm rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};