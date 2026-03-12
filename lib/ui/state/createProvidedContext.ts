import { createContext as baseCreateContext } from 'react'

export const createProvidedContext = <T>() =>
  baseCreateContext<T | undefined>(undefined)
