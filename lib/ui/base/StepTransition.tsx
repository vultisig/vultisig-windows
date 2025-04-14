import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { ReactNode } from 'react'

import { useBoolean } from '../hooks/useBoolean'

type StepTransitionProps = {
  from: (props: OnFinishProp) => ReactNode
  to: (props: OnBackProp) => ReactNode
}

export const StepTransition = ({ from, to }: StepTransitionProps) => {
  const [value, { set: onFinish, unset: onBack }] = useBoolean(false)

  return <>{value ? to({ onBack }) : from({ onFinish })}</>
}
