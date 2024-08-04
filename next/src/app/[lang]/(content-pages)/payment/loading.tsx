export default function Loading() {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center max-md:items-start max-md:text-start">
      <div className="skeleton h-12 w-96 max-w-full self-center" />
      <div className="skeleton h-6 w-full max-w-xl" />
      <div className="skeleton h-6 w-full max-w-xl" />
      <div className="skeleton h-6 w-full max-w-xl" />
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
