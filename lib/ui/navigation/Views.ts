import { ReactNode } from 'react'

export type Views<T extends string = string> = Record<T, () => ReactNode>
