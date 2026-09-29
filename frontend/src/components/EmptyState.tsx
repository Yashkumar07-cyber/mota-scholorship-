import React from 'react';
import { LucideIcon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileText,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-card p-8 border border-dashed border-slate-300 text-center max-w-md mx-auto my-6 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{description}</p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
