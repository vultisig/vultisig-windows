import { getCurrentHeight } from '../services/getCurrentHeight'

export const useCurrentHeightQuery = () => {
  return {
    queryKey: ['current-height'],
    queryFn: getCurrentHeight,
  }
}
