import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { ReactNode } from 'react'

import { useBoolean } from '../hooks/useBoolean'

type StepTransitionProps = {
  from: (props: OnForwardProp) => ReactNode
  to: (props: OnBackProp) => ReactNode
}

export const StepTransition = ({ from, to }: StepTransitionProps) => {
  const [value, { set: onForward, unset: onBack }] = useBoolean(false)

  return <>{value ? to({ onBack }) : from({ onForward })}</>
}
