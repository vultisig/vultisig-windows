import { SpringConfig } from '@react-spring/web'

const defaultAnimationConfig = {
  duration: 300,
  easing: ((t: number) => t * (2 - t)) as SpringConfig['easing'],
  enter: { opacity: 1, transform: 'scale(1)' },
  from: { opacity: 0, transform: 'scale(0.95)' },
  leave: { opacity: 0, transform: 'scale(0.95)' },
}

const topToBottomAnimationConfig = {
  duration: 300,
  easing: ((t: number) => t * (2 - t)) as SpringConfig['easing'],
  enter: { opacity: 1, transform: 'translateY(0)' },
  from: { opacity: 0, transform: 'translateY(-100%)' },
  leave: { opacity: 0, transform: 'translateY(-100%)' },
}

const bottomToTopAnimationConfig = {
  duration: 300,
  easing: ((t: number) => t * (2 - t)) as SpringConfig['easing'],
  enter: { opacity: 1, transform: 'translateY(0)' },
  from: { opacity: 0, transform: 'translateY(100%)' },
  leave: { opacity: 0, transform: 'translateY(100%)' },
}

export const configsMap = {
  bottomToTop: bottomToTopAnimationConfig,
  scale: defaultAnimationConfig,
  topToBottom: topToBottomAnimationConfig,
}

export type ConfigKey = keyof typeof configsMap
export type ConfigValue = (typeof configsMap)[keyof typeof configsMap]
