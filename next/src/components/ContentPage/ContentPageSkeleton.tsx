export function ContentPageSkeleton() {
  return (
    <div className="flex w-full animate-pulse gap-12">
      {/* Main Content Area Skeleton */}
      <div className="flex w-full flex-col gap-12">
        {/* Banner Skeleton */}
        <div className="h-64 w-full rounded-lg bg-gray-200 max-md:h-44 dark:bg-gray-800" />

        {/* Title & Metadata Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-10 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-48 rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Article Body Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-11/12 rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-4/5 rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-24 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-9/12 rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Contact Banner Skeleton */}
        <div className="flex h-44 w-full flex-col items-center justify-center gap-3 rounded-xl bg-gray-200 p-6 dark:bg-gray-800" />
      </div>

      {/* Side Navigation & Partners Skeleton */}
      <div className="sticky top-36 flex h-[calc(100vh-180px)] w-full max-w-80 flex-col gap-8 max-lg:hidden">

        {/* Side Partners Skeleton */}
        <div className="flex flex-col gap-4 px-4">
          <div className="h-6 w-24 rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
