"use client";

import type { ImgHTMLAttributes } from "react";

/** img that never renders with an empty src (avoids browser re-fetch warnings). */
export default function SafeImg({
  src,
  alt,
  className,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  if (!src) {
    return <span aria-hidden className={`block bg-neutral-900 ${className ?? ""}`} />;
  }
   
  return <img src={src} alt={alt} className={className} {...rest} />;
}
