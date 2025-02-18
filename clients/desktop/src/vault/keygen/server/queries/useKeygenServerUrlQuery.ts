import { useQuery } from '@tanstack/react-query'

import {
  getKeygenServerUrl,
  GetKeygenServerUrlInput,
} from '../utils/getKeygenServerUrl'

export const useKeygenServerUrlQuery = (input: GetKeygenServerUrlInput) => {
  return useQuery({
    queryKey: ['keygenServerUrl', input],
    queryFn: () => getKeygenServerUrl(input),
  })
}
