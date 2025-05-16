import { GetMpcServerUrlInput, useCore } from '@core/ui/state/core'
import { useQuery } from '@tanstack/react-query'

export const useMpcServerUrlQuery = (input: GetMpcServerUrlInput) => {
  const { getMpcServerUrl } = useCore()

  return useQuery({
    queryKey: ['mpcServerUrl', input],
    queryFn: () => getMpcServerUrl(input),
  })
}
