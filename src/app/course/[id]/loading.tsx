export default function CourseDetailLoading() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-24 pt-6 animate-pulse">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-4 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-4 rounded bg-slate-200" />
          <div className="h-4 w-48 rounded bg-slate-200" />
        </div>

        {/* Title Header Skeleton */}
        <div className="flex items-center gap-4 border-b border-slate-200/80 pb-6">
          <div className="size-10 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-2/3 rounded-xl bg-slate-300" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid Skeleton */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
          {/* Left Column (Video & Content Details) */}
          <div className="space-y-8 min-w-0">
            {/* Aspect Video Skeleton Player */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 aspect-video w-full relative flex items-center justify-center">
              <div className="size-14 rounded-full bg-slate-800 flex items-center justify-center">
                <div className="size-6 rounded bg-slate-700" />
              </div>
            </div>

            {/* Tabs List Skeleton */}
            <div className="flex gap-3 border-b border-slate-200 pb-2">
              <div className="h-8 w-24 rounded-full bg-indigo-100" />
              <div className="h-8 w-20 rounded-full bg-slate-200" />
              <div className="h-8 w-16 rounded-full bg-slate-200" />
              <div className="h-8 w-24 rounded-full bg-slate-200" />
            </div>

            {/* Content Cards Skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
              <div className="h-6 w-40 rounded-lg bg-slate-300" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-5/6 rounded bg-slate-200" />
                <div className="h-4 w-4/5 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            {/* Pricing Box Skeleton */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 space-y-4 shadow-2xs">
              <div className="h-4 w-28 rounded bg-rose-100" />
              <div className="h-8 w-40 rounded-xl bg-slate-300" />
              <div className="h-11 w-full rounded-xl bg-rose-200" />
            </div>

            {/* Accordion Curriculum Skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="h-5 w-36 rounded bg-slate-300" />
                <div className="h-4 w-16 rounded bg-slate-200" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 p-3 flex justify-between items-center">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="h-3 w-12 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
