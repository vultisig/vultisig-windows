import { ChildrenProp } from '@lib/ui/props'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { I18nProvider } from '../i18n/I18nProvider'

const queryClient = new QueryClient()

export const ExtensionProviders = ({ children }: ChildrenProp) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  )
}
