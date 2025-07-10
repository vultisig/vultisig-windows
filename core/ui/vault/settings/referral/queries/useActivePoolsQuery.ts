import { getActivePools } from '../serivces/getActivePools'

export const useActivePoolsQuery = () => {
  return {
    queryKey: ['active-pools'],
    queryFn: getActivePools,
  }
}
