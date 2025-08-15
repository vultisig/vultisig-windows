import { QueryClientProvider } from '@core/ui/query/QueryClientProvider'
import { ChildrenProp } from '@lib/ui/props'

import { queriesPersister } from './storage/queriesPersister'

export const ExtensionQueryClientProvider = ({ children }: ChildrenProp) => {
  return (
    <QueryClientProvider persister={queriesPersister}>
      {children}
    </QueryClientProvider>
  )
}
