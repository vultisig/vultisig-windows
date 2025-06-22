import { ButtonHTMLAttributes } from 'react'

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled'
> & {
  disabled?: boolean | string
  kind?: 'primary' | 'secondary' | 'link'
  loading?: boolean
  status?: 'default' | 'danger' | 'success' | 'warning'
}
