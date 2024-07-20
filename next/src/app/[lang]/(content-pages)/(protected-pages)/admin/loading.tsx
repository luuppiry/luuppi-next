export default function Loading() {
  return (
    <div className="relative">
      <div className="skeleton h-12 w-96 max-w-full" />
      <div className="card card-body mt-12 p-4">
        <div className="skeleton h-10 w-40" />
      </div>
      <div className="flex w-full flex-col gap-8">
        <div className="card card-body mt-8">
          <div className="skeleton mb-1 h-4 w-28" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton mt-2 h-12 w-28" />
        </div>
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
