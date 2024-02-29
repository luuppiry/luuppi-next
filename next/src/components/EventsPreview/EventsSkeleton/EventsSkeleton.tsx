export default function EventsSkeleton() {
  return Array.from({ length: 4 }, (_, i) => (
    <div key={i} className="group relative">
      <div className="absolute z-20 flex h-full w-full flex-col justify-end rounded-lg bg-gradient-to-t from-primary-800 via-black/50 to-transparent p-6 transition-all duration-300">
        <div className="skeleton mb-4 h-4 w-1/2 rounded-lg" />
        <div className="skeleton mb-4 h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
      </div>
      <div className="relative flex aspect-[5/6] h-full w-full overflow-hidden rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:aspect-[2/1]">
        <div className="skeleton h-full w-full bg-transparent opacity-50" />
      </div>
    </div>
  ));
}
