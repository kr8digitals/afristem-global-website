import { PageHero } from "@/components/ui/primitives";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string[] }[] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Last updated: ${updated}`} compact />
      <section className="py-16 sm:py-20">
        <div className="container-x max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="font-display text-2xl font-bold text-navy-900">{s.h}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-navy-800/75">{s.p.map((t) => <p key={t}>{t}</p>)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
