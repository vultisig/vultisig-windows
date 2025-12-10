import { queryUrl } from '@lib/utils/query/queryUrl'

import { thornodeBaseUrl } from '../../constants'

export const getThorchainConstants = () =>
  queryUrl<{ int_64_values: { MinRuneForTCYStakeDistribution: number } }>(
    `${thornodeBaseUrl}/constants`
  )

export const getLastBlock = async () => {
  const data = await queryUrl<Array<{ thorchain?: number }>>(
    `${thornodeBaseUrl}/lastblock`
  )
  return data?.[0]?.thorchain ?? 0
}
