import { usdc } from '@core/chain/coin/knownTokens'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

import { circleApiUrl } from './config'

type CircleTokenBalance = {
  amount: string
}

type CircleBalanceResponse = {
  data?: {
    tokenBalances?: CircleTokenBalance[]
  }
}

export const getCircleAccountUsdcBalance = async (
  walletId: string
): Promise<bigint> => {
  const url = addQueryParams(
    `${circleApiUrl}/v1/w3s/wallets/${walletId}/balances`,
    { tokenAddress: usdc.id }
  )

  const response = await fetch(url)

  if (response.status === 404) {
    return 0n
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch Circle balance: ${response.statusText}`)
  }

  const data: CircleBalanceResponse = await response.json()
  const [balance] = data?.data?.tokenBalances ?? []

  return BigInt(balance?.amount ?? '0')
}
