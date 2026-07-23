export default function CoursesLoading() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Header */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="h-8 w-64 rounded-xl bg-slate-200 mx-auto" />
          <div className="h-4 w-96 rounded-lg bg-slate-100 mx-auto" />
        </div>

        {/* Filter Toolbar */}
        <div className="h-14 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs flex items-center justify-between">
          <div className="h-8 w-48 rounded-xl bg-slate-100" />
          <div className="h-8 w-64 rounded-xl bg-slate-100" />
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 rounded-2xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-xs">
              <div className="h-40 w-full rounded-xl bg-slate-200" />
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 rounded bg-slate-200" />
                <div className="h-8 w-24 rounded-lg bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
