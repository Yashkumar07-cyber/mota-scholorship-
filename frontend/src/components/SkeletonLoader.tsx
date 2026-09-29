import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-card p-4 border border-slate-200 shadow-sm animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-1/5" />
    </div>
    <div className="h-3 bg-slate-100 rounded w-3/4" />
    <div className="h-3 bg-slate-100 rounded w-1/2" />
    <div className="pt-2 flex gap-2">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="h-8 bg-slate-100 rounded w-1/4" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const MetricSkeleton: React.FC = () => (
  <div className="bg-white rounded-card p-4 border border-slate-200 shadow-sm animate-pulse flex items-center gap-3">
    <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
    <div className="space-y-1.5 flex-1">
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-5 bg-slate-300 rounded w-3/4" />
    </div>
  </div>
);
