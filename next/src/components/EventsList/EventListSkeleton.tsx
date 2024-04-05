export default function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="skeleton h-10 w-36" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-28 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
