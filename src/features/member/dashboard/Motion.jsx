import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

export const easeOut = [0.22, 1, 0.36, 1]

export function Reveal({ children, className = '', delay = 0, amount = 0.18, as = 'div' }) {
  const reduced = useReducedMotion()
  const Component = motion[as] || motion.div

  return <Component
    className={className}
    initial={reduced ? false : { opacity: 0, y: 18 }}
    whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount }}
    transition={{ duration: 0.45, delay, ease: easeOut }}
  >{children}</Component>
}

export function AnimatedNumber({ value, decimals = 0, suffix = '', className = '' }) {
  const reduced = useReducedMotion()
  const count = useMotionValue(reduced ? value : 0)
  const [displayValue, setDisplayValue] = useState(() => (reduced ? value : Number((reduced ? value : 0).toFixed(decimals))))

  useMotionValueEvent(count, 'change', (latest) => {
    setDisplayValue(Number(latest.toFixed(decimals)))
  })

  useEffect(() => {
    if (reduced) {
      count.set(value)
      setDisplayValue(Number(value.toFixed(decimals)))
      return undefined
    }

    const controls = animate(count, value, { duration: 0.8, ease: easeOut })
    return controls.stop
  }, [count, reduced, value])

  return <motion.span className={className}>{displayValue}{suffix}</motion.span>
}

export function Stagger({ children, className = '', delayChildren = 0.08, staggerChildren = 0.06 }) {
  const reduced = useReducedMotion()
  return <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.16 }}
    variants={{ hidden: {}, visible: { transition: { delayChildren, staggerChildren } } }}
    {...(reduced ? { initial: false, whileInView: undefined } : {})}
  >{children}</motion.div>
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easeOut } },
}
