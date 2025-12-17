import { Chain } from '@core/chain/Chain'
import { getErc20Balance } from '@core/chain/chains/evm/erc20/getErc20Balance'
import { usdc } from '@core/chain/coin/knownTokens'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { Address } from 'viem'

export const getCircleAccountUsdcBalance = async (
  mscaAddress: string
): Promise<bigint> => {
  return getErc20Balance({
    chain: Chain.Ethereum,
    address: shouldBePresent(usdc.id) as Address,
    accountAddress: mscaAddress as Address,
  })
}
