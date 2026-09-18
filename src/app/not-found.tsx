import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy-950 pt-24 text-white noise">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-0 size-[30rem] rounded-full bg-sun-400/25 blur-[120px]" aria-hidden />
      <div className="container-x relative text-center">
        <p className="font-display text-[8rem] font-extrabold leading-none text-gradient-sun sm:text-[12rem]">404</p>
        <h1 className="h2 mt-2">This experiment didn&apos;t produce a result.</h1>
        <p className="lead mx-auto mt-4 max-w-xl text-white/70">The page you&apos;re looking for has moved or never existed. Let&apos;s get you back to discovering STEM.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary"><Home className="size-4" /> Back home</Link>
          <Link href="/programmes" className="btn-ghost-light">Explore programmes <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
