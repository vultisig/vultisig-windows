import { Chain } from '@vultisig/core-chain/Chain'
import { swapEnabledChains } from '@vultisig/core-chain/swap/swapEnabledChains'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useMemo } from 'react'

import { useAvailableChains } from '../../state/useAvailableChains'

export const useSwapEnabledChainsForVault = (): readonly Chain[] => {
  const availableChains = useAvailableChains()

  return useMemo(
    () => availableChains.filter(chain => isOneOf(chain, swapEnabledChains)),
    [availableChains]
  )
}
