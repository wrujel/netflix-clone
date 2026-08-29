import type { ImgHTMLAttributes } from "react";

type StaticImport = { src: string };

type StubImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | StaticImport;
  // Next-only props that have no <img> equivalent; accepted and dropped.
  fill?: boolean;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
};

/**
 * Test double for `next/image`. The real component needs the Next runtime for
 * its image config and loaders, so tests render a plain <img> instead and keep
 * every prop observable through the DOM.
 */
const NextImageStub = ({
  src,
  alt,
  fill,
  priority,
  placeholder,
  blurDataURL,
  sizes,
  ...rest
}: StubImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={typeof src === "string" ? src : src.src}
    alt={alt ?? ""}
    data-fill={fill ? "true" : undefined}
    data-priority={priority ? "true" : undefined}
    data-placeholder={placeholder}
    data-blur={blurDataURL}
    data-sizes={sizes}
    {...rest}
  />
);

export default NextImageStub;
