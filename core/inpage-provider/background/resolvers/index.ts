import { getIsWalletPrioritized } from '@core/extension/storage/isWalletPrioritized'
import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getTokenMetadata } from '@vultisig/core-chain/coin/token/metadata'

import { broadcastTx } from './broadcastTx'
import { evmClientRequest } from './evmClientRequest'
import { exportVault } from './exportVault'
import { getAccount } from './getAccount'
import { getAppChain } from './getAppChain'
import { getAppChainId } from './getAppChainId'
import { getEvmSigningChain } from './getEvmSigningChain'
import { getTx } from './getTx'
import { hasAppSession } from './hasAppSession'
import { hasChainInVault } from './hasChainInVault'
import {
  getKeplrSuggestedChains,
  suggestKeplrChain,
} from './keplrSuggestedChains'
import { setAppChain } from './setAppChain'
import { signOut } from './signOut'
import { suiBuildTransaction } from './suiBuildTransaction'
import { suiExecuteTransaction } from './suiExecuteTransaction'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getAppChainId,
  getAppChain,
  getEvmSigningChain,
  setAppChain,
  getAccount,
  signOut,
  hasAppSession,
  evmClientRequest,
  exportVault,
  getTx,
  broadcastTx,
  getTokenMetadata: ({ input }) => getTokenMetadata(input),
  getIsWalletPrioritized: () => getIsWalletPrioritized(),
  hasChainInVault,
  getKeplrSuggestedChains,
  suggestKeplrChain,
  suiBuildTransaction,
  suiExecuteTransaction,
}
