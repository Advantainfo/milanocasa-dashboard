"use client"

import { motion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

/** Single-element fade+rise-in, for standalone sections (page header, big charts). */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerGroupProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

/** Wrap a set of StaggerItem children (e.g. a KPI grid) to fade them in one after another. */
export function StaggerGroup({ children, className, staggerDelay = 0.06 }: StaggerGroupProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
