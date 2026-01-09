import { Chain } from '@core/chain/Chain'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordKeys } from '@lib/utils/record/getRecordKeys'
import { useMemo } from 'react'

import { useCurrentVault } from './currentVault'

export const useAvailableChains = (): Chain[] => {
  const vault = useCurrentVault()

  return useMemo(() => {
    if (isKeyImportVault(vault)) {
      return getRecordKeys(shouldBePresent(vault.chainPublicKeys))
    }
    return Object.values(Chain)
  }, [vault])
}
