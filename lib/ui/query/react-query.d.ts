import '@tanstack/react-query'

type Meta = {
  disablePersist?: boolean
} & Record<string, unknown>

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: Meta
    mutationMeta: Meta
  }
}
