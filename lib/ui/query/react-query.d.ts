import '@tanstack/react-query'

type Meta = {
  shouldPersist?: boolean
} & Record<string, unknown>

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: Meta
    mutationMeta: Meta
  }
}
