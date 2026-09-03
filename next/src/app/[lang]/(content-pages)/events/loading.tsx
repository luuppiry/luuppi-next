import EventCalendarSkeleton from '@/components/EventCalendar/EventCalendarSkeleton';
import MobileCalendarSkeleton from '@/components/MobileCalendar/MobileCalendarSkeleton';

export default function EventsSkeleton() {
  return (
    <div className="relative">
      {/* Page Heading (h1) */}
      <div className="mb-12 h-10 w-48 animate-pulse rounded-md bg-gray-200 max-md:h-8 max-md:w-36 dark:bg-base-300" />

      {/* EventSelector Control Bar Skeleton */}
      <div className="flex flex-col gap-8">
        <div className="flex w-full items-center justify-between rounded-lg bg-background-50 p-4 max-md:flex-col max-md:justify-center max-md:gap-4 max-md:px-2">
          <div className="flex w-full items-center gap-4 max-md:flex-col max-md:gap-2">
            {/* View Switcher Tabs (Calendar / Event Feed) */}
            <div className="flex h-10 w-48 items-center rounded-lg border bg-white p-1 max-md:w-full dark:border-primary-300 dark:bg-inherit">
              <div className="h-full flex-1 animate-pulse rounded-md bg-gray-200 dark:bg-base-300" />
              <div className="h-full flex-1 rounded-md" />
            </div>

            <div className="flex w-full items-center justify-between">
              {/* Show Past Events Toggle Skeleton */}
              <div className="flex w-48 items-center justify-between px-1">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-base-300" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-base-300" />
              </div>

              {/* iCal Button Skeleton */}
              <div className="btn btn-primary btn-sm animate-pulse border-transparent bg-gray-200 text-transparent dark:bg-base-300">
                <div className="h-4 w-16 rounded bg-gray-300 dark:bg-base-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View Skeleton */}
        <div className="hidden min-[961px]:block">
          <EventCalendarSkeleton />
        </div>
        {/* Mobile View Skeleton */}
        <div className="block min-[961px]:hidden">
          <MobileCalendarSkeleton />
        </div>
      </div>

      {/* Background Pattern */}
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
