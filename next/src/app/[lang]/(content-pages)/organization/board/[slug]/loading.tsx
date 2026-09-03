export default function OldBoardSkeleton() {
  return (
    <div className="relative flex flex-col gap-12">
      {/* Header & Dropdown Button */}
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <div className="h-10 w-64 animate-pulse rounded-md bg-gray-200 max-md:h-8 max-md:w-48 dark:bg-base-300" />
        <div className="btn m-1 animate-pulse border-transparent bg-gray-200 text-transparent dark:bg-base-300">
          <div className="h-4 w-28 rounded bg-gray-300 dark:bg-base-100" />
        </div>
      </div>

      {/* Board Members Section */}
      <div>
        <div className="mb-6 h-9 w-48 animate-pulse rounded-md bg-gray-200 max-md:h-8 max-md:w-36 dark:bg-base-300" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-y-12 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <BoardMemberSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Officials Section */}
      <div>
        <div className="mb-6 h-9 w-40 animate-pulse rounded-md bg-gray-200 max-md:h-8 max-md:w-28 dark:bg-base-300" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-y-12 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <BoardMemberSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

function BoardMemberSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col rounded-lg border border-gray-200 bg-white shadow-lg dark:border-background-200 dark:bg-base-200">
      <div className="relative aspect-[9/10] w-full rounded-t-lg bg-gray-200 dark:bg-base-300" />
      <div className="flex flex-col gap-2 px-4 py-6">
        <div className="h-7 w-3/4 rounded bg-gray-200 max-md:h-5 dark:bg-base-300" />
        <div className="flex flex-col gap-1">
          <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-base-300" />
        </div>
      </div>
    </div>
  );
}
