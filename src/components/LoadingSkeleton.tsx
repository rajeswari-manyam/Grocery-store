export default function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-slate-100" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-slate-100 rounded w-16" />
              <div className="w-9 h-9 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
