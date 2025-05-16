import { ChildrenProp } from '@lib/ui/props'
import { queryKeyHashFn } from '@lib/ui/query/utils/queryKeyHashFn'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn,
    },
  },
})

export const QueryProvider = ({ children }: ChildrenProp) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
