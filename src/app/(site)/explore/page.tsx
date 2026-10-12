import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { content, mergeProgrammes } from "@/lib/content";
import { services } from "@/content/data";
import { eventStatusLabel } from "@/lib/events";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/structured-data";
import { PageHero } from "@/components/ui/primitives";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/explore", { title: "Find STEM Competitions, School Programmes & Teacher Training", description: "Find AFRISTEM STEM competitions, school partnerships, teacher development, coding opportunities and online science learning. Explore eligibility, dates and official resources." });

export default function ExplorePage() {
  const store = content();
  const programmes = mergeProgrammes(store.programmes);
  return <>
    <JsonLd data={breadcrumbSchema([{ name: "Explore STEM opportunities", path: "/explore" }])} />
    <PageHero eyebrow="Explore AFRISTEM" title="Find your next STEM opportunity" description="A starting point for families, schools, educators and partners looking for STEM learning and competitions in Nigeria and across Africa." compact />
    <div className="container-x space-y-16 py-16">
      <section><h2 className="h2">Which competition is right for your learners?</h2><p className="mt-4 max-w-3xl text-navy-800/75">Compare the programme focus and eligibility, then open the current event page to check dates, fees and registration status. Eligibility and arrangements depend on the edition.</p><div className="mt-7 grid gap-5 md:grid-cols-2">{programmes.map(p => <article className="card p-6" key={p.slug}><h3 className="text-xl font-bold"><Link href={`/programmes/${p.slug}`}>{p.name} — {p.subtitle}</Link></h3><p className="mt-3">{p.shortDescription}</p><p className="mt-3 text-sm text-navy-800/75">{p.eligibility}</p><Link className="mt-5 inline-block font-bold underline" href={`/programmes/${p.slug}`}>Explore {p.name} →</Link></article>)}</div></section>
      <section><h2 className="h2">Event dates, registration and results</h2><p className="mt-4">Use the official event page rather than an old flyer or forwarded message to check current registration status. A registration request is not proof of payment or confirmed admission.</p><div className="mt-7 grid gap-5 md:grid-cols-2">{[...store.events].sort((a,b) => a.start.localeCompare(b.start)).map(e => <article key={e.slug} className="card p-6"><h3 className="text-xl font-bold"><Link href={`/events/${e.slug}`}>{e.title}</Link></h3><p className="mt-3">{e.displayDate} · {e.mode}</p><p className="mt-2 text-sm">{e.registrationStatus ? eventStatusLabel(e) : e.location}</p><Link href={`/events/${e.slug}`} className="mt-4 inline-block font-bold underline">Event details and official instructions →</Link></article>)}</div></section>
      <section><h2 className="h2">STEM support for schools and educators</h2><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map(s => <article key={s.slug} className="card p-6"><h3 className="text-xl font-bold">{s.title}</h3><p className="mt-3 text-sm leading-relaxed">{s.description}</p><Link href="/services" className="mt-4 inline-block font-bold underline">Explore services →</Link></article>)}</div></section>
      <section><h2 className="h2">Where should I start?</h2><dl className="mt-7 grid gap-6 md:grid-cols-2">
        <div className="card p-6"><dt className="text-lg font-bold">I want to build STEM activities at my school.</dt><dd className="mt-3">Explore <Link className="underline" href="/schools">school partnerships</Link> and the <Link className="underline" href="/stem-guide-for-schools">STEM guide for schools</Link>. Contact the team about clubs, workshops, equipment or consultancy before committing to a plan.</dd></div>
        <div className="card p-6"><dt className="text-lg font-bold">I am a teacher or STEM professional.</dt><dd className="mt-3">See <Link className="underline" href="/educators">educator training and networking</Link> or <Link className="underline" href="/stem-professionals">mentoring and professional involvement</Link>. Ask about the current opportunities and requirements.</dd></div>
        <div className="card p-6"><dt className="text-lg font-bold">I am looking for online science learning.</dt><dd className="mt-3">The <Link className="underline" href="/digital-science-school">AFRISTEM Digital Science School overview</Link> explains its audience and provides the official sister-site link for learning and enrolment enquiries.</dd></div>
        <div className="card p-6"><dt className="text-lg font-bold">Is an opportunity available in my city?</dt><dd className="mt-3">Availability, venues and online options vary by event. Check its details and <Link href="/contact" className="underline">contact AFRISTEM</Link> with your city, school and preferred programme. Do not assume every programme has a local venue.</dd></div>
      </dl></section>
      <p className="rounded-2xl bg-sun-50 p-6">Follow <Link className="font-bold underline" href="/news">official news and announcements</Link>, browse <Link className="font-bold underline" href="/faq">frequently asked questions</Link>, or subscribe using the newsletter form below.</p>
    </div>
  </>;
}
