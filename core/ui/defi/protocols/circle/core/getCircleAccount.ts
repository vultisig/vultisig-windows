import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { circleApiUrl } from './config'

type CircleWallet = {
  id: string
  address: string
}

type CircleAccount = {
  id: string
  address: string
}

export type GetCircleAccountInput = {
  ownerAddress: string
}

export const getCircleAccount = async ({
  ownerAddress,
}: GetCircleAccountInput): Promise<CircleAccount | null> => {
  const [wallet] = await queryUrl<CircleWallet[]>(
    addQueryParams(`${circleApiUrl}/wallet`, { refId: ownerAddress })
  )

  if (!wallet) return null

  return {
    id: wallet.id,
    address: wallet.address,
  }
}
