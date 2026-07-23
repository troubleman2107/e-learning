export default function LandingPageLoading() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-200/80 p-8 md:p-12 h-[380px] sm:h-[420px] md:h-[460px] flex flex-col justify-between">
          <div className="space-y-4 max-w-xl">
            <div className="h-6 w-32 rounded-full bg-slate-300" />
            <div className="h-10 w-3/4 rounded-xl bg-slate-300" />
            <div className="h-10 w-1/2 rounded-xl bg-slate-300" />
            <div className="h-4 w-5/6 rounded-lg bg-slate-300/80" />
          </div>
          <div className="flex gap-4 pt-6">
            <div className="h-11 w-36 rounded-xl bg-slate-300" />
            <div className="h-11 w-36 rounded-xl bg-slate-300" />
          </div>
        </div>
      </section>

      {/* Trust Badges Bar Skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl border border-slate-200/80 bg-white p-3 flex items-center gap-3 shadow-2xs"
            >
              <div className="size-8 rounded-lg bg-slate-200 shrink-0" />
              <div className="h-4 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>

      {/* Category Tabs & Featured Courses Grid Skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-8 w-64 rounded-xl bg-slate-300" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-24 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-84 rounded-2xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-40 w-full rounded-xl bg-slate-200" />
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div className="h-6 w-20 rounded bg-slate-200" />
                <div className="h-8 w-24 rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
