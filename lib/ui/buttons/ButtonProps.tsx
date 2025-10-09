import { ButtonHTMLAttributes } from 'react'

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled'
> & {
  disabled?: boolean | string
  kind?: 'primary' | 'secondary' | 'link' | 'action'
  loading?: boolean
  status?: 'default' | 'danger' | 'success' | 'warning'
}
