import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { evmClientRequest } from './evmClientRequest'
import { getAccount } from './getAccount'
import { getAppChain } from './getAppChain'
import { getAppChainId } from './getAppChainId'
import { setAppChain } from './setAppChain'
import { signOut } from './signOut'

type BackgroundResolvers = {
  [K in BackgroundMethod]: BackgroundResolver<K>
}

export const backgroundResolvers: BackgroundResolvers = {
  getAppChainId,
  getAppChain,
  setAppChain,
  getAccount,
  signOut,
  evmClientRequest,
}
