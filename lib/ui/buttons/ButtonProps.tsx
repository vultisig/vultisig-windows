import { ButtonHTMLAttributes } from 'react'

type BaseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled'
> & {
  disabled?: boolean | string
  loading?: boolean
}

export type PrimaryButtonStatus = 'default' | 'neutral' | 'success' | 'danger'

export type ButtonProps = BaseButtonProps &
  ({ kind?: 'primary'; status?: PrimaryButtonStatus } | { kind: 'secondary' | 'link' | 'outlined'; status?: never })
