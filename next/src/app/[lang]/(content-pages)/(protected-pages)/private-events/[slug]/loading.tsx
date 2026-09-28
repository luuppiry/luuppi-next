export default function Loading() {
  return (
    <div className="relative">
      <div className="flex gap-12">
        <div className="flex max-w-full flex-col">
          <div className="skeleton h-56 w-[800px] max-w-full" />
          <div className="flex w-full flex-col gap-8">
            <div className="skeleton mt-12 h-12 w-80 max-w-full" />
            <div className="skeleton mt-0 h-4 w-80 max-w-full" />
            <div className="skeleton mt-0 h-28 w-[800px] max-w-full" />
            <div className="skeleton mt-8 h-8 w-48 max-w-full" />
          </div>
        </div>
        <div className="sticky top-36 h-full w-full max-w-80 max-lg:hidden">
          <div className="flex max-w-full flex-col gap-4">
            <div className="skeleton h-6 w-48 max-w-full" />
            <div className="skeleton h-8 w-64 max-w-full" />
            <div className="skeleton h-8 w-64 max-w-full" />
            <div className="skeleton h-8 w-64 max-w-full" />
          </div>
        </div>
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
