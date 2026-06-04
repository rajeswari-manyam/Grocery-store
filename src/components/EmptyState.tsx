import { PackageSearch } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <PackageSearch size={36} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all border-none cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
