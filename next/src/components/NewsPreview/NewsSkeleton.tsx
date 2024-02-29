export default function NewsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <article
          key={i}
          className={`${i === 0 ? 'col-span-3 max-lg:col-span-1 max-lg:flex-col' : 'col-span-1 flex-col'} flex gap-4 rounded-lg border border-gray-200/50 shadow-sm`}
        >
          <div
            className={`${i !== 0 ? 'shrink-0 rounded-t-lg' : 'rounded-l-lg max-lg:shrink-0 max-lg:rounded-l-none max-lg:rounded-t-lg'} skeleton relative aspect-video w-full`}
          />
          <div className="flex h-full w-full flex-col justify-between gap-12 p-4">
            <div className="flex flex-col gap-1">
              <span className="skeleton mb-2 h-4 w-1/4" />
              <span
                className={`skeleton mb-2 h-4 w-3/4 ${i === 0 ? 'text-2xl max-lg:text-xl' : 'text-xl'}`}
              />
              <span className="skeleton mb-2 h-2 w-full" />
              <span className="skeleton mb-2 h-2 w-2/3" />
              <span className="skeleton h-2 w-1/2" />
            </div>
            <div className="flex items-center gap-2">
              <div
                className="skeleton h-[50px] w-[50px]"
                style={{ borderRadius: '9999px' }}
              />
              <div className="flex flex-col">
                <span className="skeleton mb-2 h-2 w-48" />
                <span className="skeleton h-2 w-32" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
