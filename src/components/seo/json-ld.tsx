import { safeJsonLd } from "@/lib/utils";

/**
 * Renders a JSON-LD structured-data script. `safeJsonLd` escapes `<`, `>`
 * and `&` so untrusted content can never break out of the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
