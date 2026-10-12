import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * robots.txt — unrestricted crawling for search engines and AI indexers.
 *
 * The `*` group allows everything except the API and admin surfaces.
 * Explicit allow-groups follow for the major AI crawlers and answer
 * engines so that AFRISTEM content is eligible for AI Overviews,
 * ChatGPT search, Perplexity answers, Claude citations, etc.
 */
const DISALLOW = ["/api/", "/admin", "/admin/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Universal rule — search engines and all other well-behaved bots.
      { userAgent: "*", allow: "/", disallow: DISALLOW },

      // OpenAI (ChatGPT training, ChatGPT search/browsing).
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User"], allow: "/", disallow: DISALLOW },

      // Google AI experiences (AI Overviews, Gemini).
      { userAgent: ["Google-Extended", "GoogleOther", "GoogleOther-Image", "GoogleOther-Video"], allow: "/", disallow: DISALLOW },

      // Perplexity AI.
      { userAgent: ["PerplexityBot", "Perplexity-User"], allow: "/", disallow: DISALLOW },

      // Anthropic (Claude training + Claude browsing/search).
      { userAgent: ["ClaudeBot", "Claude-User", "Claude-SearchBot", "Claude-Web", "anthropic-ai"], allow: "/", disallow: DISALLOW },

      // Apple Intelligence / Siri.
      { userAgent: ["Applebot", "Applebot-Extended"], allow: "/", disallow: DISALLOW },

      // Meta AI.
      { userAgent: ["Meta-ExternalAgent", "FacebookExternalHit"], allow: "/", disallow: DISALLOW },

      // Other major search + AI crawlers.
      {
        userAgent: [
          "Bingbot",
          "BingPreview",
          "DuckDuckBot",
          "Amazonbot",
          "Bytespider",
          "cohere-ai",
          "cohere-Training-Data-Cleaner",
          "YouBot",
          "MistralAI-User",
          "Meta-User",
          "ICC-Crawler",
          "ImagesiftBot",
        ],
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
