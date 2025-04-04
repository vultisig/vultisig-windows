import { ChildrenProp } from '@lib/ui/props'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const QueryProvider = ({ children }: ChildrenProp) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
