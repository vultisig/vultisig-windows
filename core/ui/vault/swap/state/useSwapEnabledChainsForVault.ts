import { Chain } from '@core/chain/Chain'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useMemo } from 'react'

import { useAvailableChains } from '../../state/useAvailableChains'

export const useSwapEnabledChainsForVault = (): readonly Chain[] => {
  const availableChains = useAvailableChains()

  return useMemo(
    () => availableChains.filter(chain => isOneOf(chain, swapEnabledChains)),
    [availableChains]
  )
}
