import { Chain } from '@core/chain/Chain'

import {
  useCurrentVaultAddresses,
  useCurrentVaultChainCoins,
} from '../../state/currentVaultCoins'
import { computeMintOptions } from '../utils/options'

export const useMintOptions = () => {
  const thorCoins = useCurrentVaultChainCoins(Chain.THORChain)
  const addresses = useCurrentVaultAddresses()
  return computeMintOptions({
    thorCoins,
    thorAddress: addresses[Chain.THORChain],
  })
}
