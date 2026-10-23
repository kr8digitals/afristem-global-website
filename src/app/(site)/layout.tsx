import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingActions } from "@/components/layout/floating-actions";
import { getContent, visibleAnnouncement } from "@/lib/content";

/**
 * Site pages render dynamically so that edits made in the admin dashboard
 * appear on the very next request. All the content for a page comes from one
 * database call (memoised per request).
 */
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { announcement, site, programmes } = await getContent();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-sun-400 focus:px-5 focus:py-3 focus:font-bold focus:text-navy-950"
      >
        Skip to content
      </a>
      <Header announcement={visibleAnnouncement(announcement)} contact={{ phone: site.primaryPhone, whatsapp: site.whatsapp }} />
      {/* overflow-x-clip contains the entrance animations (which begin offset on the
        x-axis) so a page can never be dragged sideways on a phone. It is not
        overflow-x-hidden: that would create a scroll container and break the
        sticky sub-navigation on the services page. */}
      <main id="main" className="overflow-x-clip">{children}</main>
      <Footer
        settings={{
          email: site.email,
          phone: site.primaryPhone,
          whatsapp: site.whatsapp,
          address: site.address,
          programmes: programmes.filter((p) => p.slug && p.name).map((p) => ({ name: p.name, slug: p.slug })),
          footerNote: site.footerNote,
          socials: site.socials,
          offices: site.offices,
          externalLinks: site.externalLinks,
        }}
      />
      <FloatingActions whatsapp={site.whatsapp} phone={site.primaryPhone} />
    </>
  );
}
