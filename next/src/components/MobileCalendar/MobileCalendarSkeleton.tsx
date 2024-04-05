export default function MobileCalendarSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="skeleton h-8 w-14" />
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-14" />
      </div>
      <div className="mb-4 flex gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-6 w-full" />
        ))}
      </div>
      <div className="grid w-full grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-1">
                <div className="skeleton h-16 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
