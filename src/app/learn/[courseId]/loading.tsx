export default function LearnCourseLoading() {
  return (
    <div className="min-h-screen bg-slate-50/60 animate-pulse flex flex-col font-sans">
      {/* Top Header Bar Skeleton */}
      <div className="sticky top-16 z-30 bg-white/95 border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-[1536px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-24 rounded-xl bg-slate-200" />
            <div className="h-4 w-48 rounded bg-slate-300" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-36 rounded-xl bg-purple-100" />
            <div className="h-8 w-28 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Skeleton */}
      <main className="flex-1 mx-auto max-w-[1536px] w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column (Widescreen Video & Controls Skeleton) */}
          <div className="flex-1 w-full space-y-6">
            {/* 16:9 Aspect Video Player */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
              <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center">
                <div className="size-7 rounded bg-slate-700" />
              </div>
            </div>

            {/* Action Bar & Lesson Info Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 rounded-full bg-purple-100" />
                  <div className="h-7 w-3/4 rounded-xl bg-slate-300" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-24 rounded-xl bg-slate-200" />
                  <div className="h-9 w-36 rounded-xl bg-purple-200" />
                  <div className="h-9 w-24 rounded-xl bg-slate-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Curriculum Sidebar Skeleton) */}
          <div className="w-full lg:w-85 xl:w-90 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="h-5 w-36 rounded bg-slate-300" />
              <div className="h-4 w-16 rounded bg-purple-100" />
            </div>

            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200/60 bg-slate-50 p-3 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-300" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-8 w-full rounded-lg bg-white border border-slate-200/60" />
                  <div className="h-8 w-full rounded-lg bg-white border border-slate-200/60" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
