import Image, { type ImageProps } from "next/image";

/**
 * next/image for pictures managed in the admin dashboard.
 *
 * Admins can paste any image link (YouTube thumbnails, a partner's logo URL…).
 * next/image refuses hosts that are not whitelisted in next.config, which used
 * to crash the whole page, so absolute URLs are shown as-is (unoptimised).
 * Site images (/images/…) and uploads (/api/media/…) are still optimised.
 */
export function ContentImage({ src, alt, unoptimized, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  const external = /^(https?:)?\/\//i.test(src);
  return <Image src={src} alt={alt} unoptimized={unoptimized || external} {...rest} />;
}
