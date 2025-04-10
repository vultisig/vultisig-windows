import { ElementType, ReactNode, SVGProps } from 'react'

export type OnCloseProp = {
  onClose: () => void
}

export type IconProp = {
  icon: ReactNode
}

export type ChildrenProp = {
  children: ReactNode
}

export type OnBackProp = {
  onBack: () => void
}

export type OnForwardProp = {
  onForward: () => void
}

export type ClassNameProp = {
  className?: string
}

export type OnClickProp = {
  onClick: () => void
}

export type OnFinishProp<
  T = void,
  Mode extends 'required' | 'optional' = 'required',
> = [T] extends [void]
  ? { onFinish: () => void }
  : Mode extends 'optional'
    ? { onFinish: (value?: T) => void }
    : { onFinish: (value: T) => void }

export type InputProps<T> = {
  value: T
  onChange: (value: T) => void
}

export type TitleProp = {
  title: ReactNode
}

export type UiProps = {
  style?: React.CSSProperties
  className?: string
}

export type LabelProp = {
  label: ReactNode
}

export type ValueProp<T> = {
  value: T
}

export type OptionsProp<T> = {
  options: readonly T[]
}

export type IsActiveProp = {
  isActive?: boolean
}

export type IsDisabledProp = {
  isDisabled?: boolean | string
}

export type IndexProp = {
  index: number
}

export type OnRemoveProp = {
  onRemove: () => void
}

export type AsProp<T extends ElementType = ElementType> = {
  as?: T
}

export type ActionProp = {
  action: ReactNode
}

export type StatusProp<T> = {
  status: T
}

export type SvgProps = SVGProps<SVGSVGElement>

export type MessageProp = {
  message: ReactNode
}
