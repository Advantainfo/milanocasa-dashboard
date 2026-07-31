"use client"

import { useId } from "react"

interface LogoMarkProps {
  className?: string
}

/**
 * An ascending line-chart glyph that reads as "M" - money trending up,
 * rendered in `currentColor` so callers control the tint via text-* classes.
 * The glow filter gets a per-instance id (useId) so multiple copies on one
 * page (desktop sidebar + mobile nav sheet) never collide.
 */
export function LogoMark({ className }: LogoMarkProps) {
  const filterId = useId()

  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M4.5 24.5 L10 8.5 L16 19 L22 8.5 L27.5 24.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
      />
      <circle cx="22" cy="8.5" r="2" fill="currentColor" filter={`url(#${filterId})`} />
    </svg>
  )
}
