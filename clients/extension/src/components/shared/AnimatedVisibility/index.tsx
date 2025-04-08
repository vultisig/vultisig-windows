import {
  ConfigKey,
  configsMap,
  ConfigValue,
} from '@clients/extension/src/components/shared/AnimatedVisibility/animationConfigs'
import {
  animated,
  AnimationConfig,
  AnimationResult,
  useTransition,
} from '@react-spring/web'
import { CSSProperties, FC, ReactNode, useLayoutEffect, useState } from 'react'

// Create an animated wrapper component
const AnimatedDiv = animated('div')

type AnimatedVisibilityProps = {
  customAnimationConfig?: ConfigValue
  children: ReactNode
  className?: string
  animationConfig?: ConfigKey
  isOpen?: boolean
  delay?: number
  config?: Partial<AnimationConfig>
  overlayStyles?: CSSProperties
  onAnimationComplete?: () => void
}

export const AnimatedVisibility: FC<AnimatedVisibilityProps> = ({
  isOpen = true,
  children,
  overlayStyles,
  customAnimationConfig,
  animationConfig = 'scale',
  className,
  delay = 0,
  onAnimationComplete,
  config,
}) => {
  const [delayedIsOpen, setDelayedIsOpen] = useState(false)

  useLayoutEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setDelayedIsOpen(true), delay)
      return () => clearTimeout(timeout)
    } else {
      setDelayedIsOpen(false)
    }
  }, [isOpen, delay])

  const animationConfigDerived =
    customAnimationConfig ?? configsMap[animationConfig]

  const transitions = useTransition(delayedIsOpen, {
    config: {
      duration: animationConfigDerived.duration,
      easing: animationConfigDerived.easing,
      ...config,
    },
    enter: animationConfigDerived.enter,
    from: animationConfigDerived.from,
    leave: animationConfigDerived.leave,
    onRest: (animationResult: AnimationResult) => {
      const result = animationResult.value as { opacity: number }
      if (result.opacity !== 0) return
      if (animationResult.finished) onAnimationComplete?.()
    },
  })

  return transitions(
    (styles, item) =>
      item && (
        <AnimatedDiv
          className={className}
          style={{
            ...styles,
            ...overlayStyles,
          }}
        >
          {children}
        </AnimatedDiv>
      )
  )
}
