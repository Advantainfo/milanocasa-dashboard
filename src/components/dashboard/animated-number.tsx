"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  formatFn?: (value: number) => string
  duration?: number
  className?: string
}

/** Counts up from its previous value to `value` on change, honoring reduced-motion. */
export function AnimatedNumber({
  value,
  formatFn = (n) => String(Math.round(n)),
  duration = 900,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(0)

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const effectiveDuration = prefersReduced ? 0 : duration

    const from = fromRef.current
    const start = performance.now()
    let frame: number

    function tick(now: number) {
      const progress =
        effectiveDuration === 0 ? 1 : Math.min(1, (now - start) / effectiveDuration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (value - from) * eased)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span className={className}>{formatFn(display)}</span>
}
