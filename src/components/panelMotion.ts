import type { Variants } from 'motion/react'

export const panelEase = [0.16, 1, 0.3, 1] as const

export const panelLayerVariants: Variants = {
  closed: { transition: { when: 'afterChildren' } },
  open: { transition: { when: 'beforeChildren' } },
}

export const panelBackdropVariants: Variants = {
  closed: {
    opacity: 0,
    transition: { duration: .18, ease: 'easeIn' },
  },
  open: {
    opacity: 1,
    transition: { duration: .24, ease: 'easeOut' },
  },
}

export const panelFromRightVariants: Variants = {
  closed: {
    x: 'calc(100% + 64px)',
    transition: { duration: .4, ease: [0.7, 0, 0.84, 0] },
  },
  open: {
    x: 0,
    transition: { duration: .62, ease: panelEase },
  },
}

export const panelFromBottomVariants: Variants = {
  closed: {
    y: 'calc(100% + 48px)',
    transition: { duration: .38, ease: [0.7, 0, 0.84, 0] },
  },
  open: {
    y: 0,
    transition: { duration: .58, ease: panelEase },
  },
}
