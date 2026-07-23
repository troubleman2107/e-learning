export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-72 rounded-lg bg-gray-100" />
      </div>

      {/* Stats Cards skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-gray-200/60 bg-white p-6 shadow-xs flex items-center gap-4">
            <div className="size-12 rounded-lg bg-gray-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-6 w-12 rounded bg-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="h-6 w-36 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-100" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-gray-50 flex items-center justify-between px-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
