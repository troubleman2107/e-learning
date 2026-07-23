export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-gray-200" />
        <div className="h-4 w-80 rounded-lg bg-gray-100" />
      </div>

      {/* Quick Summary Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs space-y-2">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-6 w-32 rounded bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="h-16 rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs flex flex-col sm:flex-row justify-between gap-3">
        <div className="h-9 w-64 rounded-lg bg-gray-100" />
        <div className="h-9 w-72 rounded-lg bg-gray-100" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-xs p-6 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 w-full rounded-lg bg-gray-50 flex items-center justify-between px-4">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-6 w-24 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
