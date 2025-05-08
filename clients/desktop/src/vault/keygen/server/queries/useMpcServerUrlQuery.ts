import { useQuery } from '@tanstack/react-query'

import { getMpcServerUrl, GetMpcServerUrlInput } from '../utils/getMpcServerUrl'

export const useMpcServerUrlQuery = (input: GetMpcServerUrlInput) => {
  return useQuery({
    queryKey: ['mpcServerUrl', input],
    queryFn: () => getMpcServerUrl(input),
  })
}
