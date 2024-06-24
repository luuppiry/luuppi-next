export default function Loading() {
  return (
    <>
      <div className="skeleton mb-12 h-12 w-48" />
      <div className="flex w-full flex-col gap-8">
        <div className="card card-body">
          <div className="skeleton mb-1 h-4 w-28" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton mt-2 h-12 w-28" />
        </div>
        <div className="card card-body">
          <div className="skeleton mb-1 h-4 w-28" />
          <div className="skeleton mb-2 h-12 w-full" />
          <div className="skeleton mb-1 h-4 w-28" />
          <div className="skeleton mb-2 h-12 w-full" />
          <div className="skeleton mb-1 h-4 w-28" />
          <div className="skeleton mb-2 h-12 w-full" />
          <div className="skeleton h-12 w-28" />
        </div>
      </div>
    </>
  );
}
