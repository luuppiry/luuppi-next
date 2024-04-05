export default function EventCalendarSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="skeleton h-10 w-28" />
        <div className="flex gap-4">
          <div className="skeleton h-10 w-20" />
          <div className="skeleton h-10 w-20" />
        </div>
        <div className="skeleton h-10 w-20" />
      </div>
      <div className="grid w-full grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-36 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
