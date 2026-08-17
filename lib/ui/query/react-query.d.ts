import '@tanstack/react-query'

import { QueryCategory } from './utils/options'

type Meta = {
  shouldPersist?: boolean
  category?: QueryCategory
} & Record<string, unknown>

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: Meta
    mutationMeta: Meta
  }
}
