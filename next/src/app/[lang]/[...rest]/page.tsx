import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-20">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-6xl font-extrabold">Not Found - 404</h1>
        <p className="text-lg">Could not find requested resource</p>
        <div>
          <Link className="btn btn-primary text-lg text-white" href="/">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
