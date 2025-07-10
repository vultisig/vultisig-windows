import { getCurrentHeight } from '../serivces/getCurrentHeight'

export const useCurrentHeightQuery = () => {
  return {
    queryKey: ['current-height'],
    queryFn: getCurrentHeight,
  }
}
