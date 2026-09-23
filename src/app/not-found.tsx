import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 px-6 text-center text-white">
      <div>
        <p className="font-display text-6xl font-extrabold text-sun-400">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-white/60">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-sun-400 px-6 py-3 text-sm font-bold text-navy-950">
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
