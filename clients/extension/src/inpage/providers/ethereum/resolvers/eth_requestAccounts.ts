import { requestAccount } from '@clients/extension/src/inpage/providers/core/requestAccount'

import { getChain } from '../utils'

export const requestEthAccounts = async (
  params: [{ preselectFastVault?: boolean }] | undefined
): Promise<string[]> => {
  const chain = await getChain()
  const preselectFastVault = params?.[0]?.preselectFastVault

  const { address } = await requestAccount(chain, { preselectFastVault })

  return [address]
}
