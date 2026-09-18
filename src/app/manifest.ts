import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AFRISTEM — The African STEM Experience",
    short_name: "AFRISTEM",
    description: "Making STEM exciting, practical and accessible for the next generation of African innovators.",
    start_url: "/",
    display: "standalone",
    background_color: "#04122f",
    theme_color: "#0b2a6f",
    icons: [
      { src: "/images/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
