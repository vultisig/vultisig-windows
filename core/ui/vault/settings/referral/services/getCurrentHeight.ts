import { queryUrl } from '@lib/utils/query/queryUrl'

import { thorchainNodeBaseUrl } from '../config'

type LastBlockEntry = { chain: string; thorchain: string }

export const getCurrentHeight = async (): Promise<number> => {
  const data = await queryUrl<LastBlockEntry[]>(
    `${thorchainNodeBaseUrl}/lastblock`
  )

  if (!data.length || !data[0].thorchain) {
    throw new Error('Invalid last block response')
  }

  return +data[0].thorchain
}
