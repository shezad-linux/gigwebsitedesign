import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-[14px] border border-border bg-white p-6 shadow-xs animate-pulse space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-lg" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 rounded" />
          </div>

          <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-200 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
