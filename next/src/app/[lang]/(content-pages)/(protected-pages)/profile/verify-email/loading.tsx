export default function Loading() {
  return (
    <div className="fixed left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-white">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );
}
