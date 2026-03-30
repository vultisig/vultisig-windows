import { getIsWalletPrioritized } from '@core/extension/storage/isWalletPrioritized'
import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getTokenMetadata } from '@vultisig/core-chain/coin/token/metadata'

import { evmClientRequest } from './evmClientRequest'
import { exportVault } from './exportVault'
import { getAccount } from './getAccount'
import { getAppChain } from './getAppChain'
import { getAppChainId } from './getAppChainId'
import { getTx } from './getTx'
import { hasChainInVault } from './hasChainInVault'
import { setAppChain } from './setAppChain'
import { setVaultChain } from './setVaultChain'
import { signOut } from './signOut'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getAppChainId,
  getAppChain,
  setAppChain,
  setVaultChain,
  getAccount,
  signOut,
  evmClientRequest,
  exportVault,
  getTx,
  getTokenMetadata: ({ input }) => getTokenMetadata(input),
  getIsWalletPrioritized: () => getIsWalletPrioritized(),
  hasChainInVault,
}
