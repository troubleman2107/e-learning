export default function CourseDetailLoading() {
  return (
    <main className="min-h-screen bg-slate-50/50 animate-pulse">
      {/* Dark Hero Section Skeleton */}
      <section className="bg-[#1c1d1f] text-white py-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:max-w-[60%] space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 rounded bg-slate-800" />
              <div className="h-3 w-3 rounded bg-slate-800" />
              <div className="h-3 w-24 rounded bg-slate-800" />
            </div>

            {/* Title & Subtitle */}
            <div className="h-8 w-4/5 rounded-xl bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-800" />
            <div className="h-4 w-2/3 rounded bg-slate-800" />

            {/* Rating & Instructor */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-4 w-24 rounded bg-slate-800" />
              <div className="h-4 w-32 rounded bg-slate-800" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content Skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column (Content & Curriculum) */}
          <div className="flex-1 space-y-8 order-2 lg:order-1">
            {/* What You'll Learn Skeleton */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-4">
              <div className="h-6 w-44 rounded-lg bg-slate-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-4 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion Skeleton */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="h-6 w-48 rounded-lg bg-slate-300" />
                <div className="h-4 w-24 rounded bg-slate-200" />
              </div>

              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-4 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-4 w-48 rounded bg-slate-200" />
                  </div>
                  <div className="h-4 w-12 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Sidebar Video Preview Card) */}
          <div className="w-full lg:w-[380px] shrink-0 order-1 lg:order-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden space-y-4 p-4">
              {/* Aspect Square Preview Image */}
              <div className="aspect-square w-full rounded-lg bg-slate-900 flex items-center justify-center">
                <div className="size-14 rounded-full bg-slate-800 flex items-center justify-center">
                  <div className="size-6 rounded bg-slate-700" />
                </div>
              </div>

              {/* Price & CTA Button Skeleton */}
              <div className="space-y-3 pt-2">
                <div className="h-8 w-36 rounded-xl bg-slate-200" />
                <div className="h-11 w-full rounded-xl bg-purple-200" />
                <div className="h-4 w-40 rounded bg-slate-100 mx-auto" />
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
