import { requestAccount } from '@clients/extension/src/inpage/providers/core/requestAccount'

import { EthereumResolver } from '../resolver'
import { getChain } from '../utils'

export const requestEthAccounts: EthereumResolver<
  [{ preselectFastVault?: boolean }] | undefined,
  string[]
> = async params => {
  const chain = await getChain()
  const preselectFastVault = params?.[0]?.preselectFastVault

  const { address } = await requestAccount(chain, { preselectFastVault })

  return [address]
}
