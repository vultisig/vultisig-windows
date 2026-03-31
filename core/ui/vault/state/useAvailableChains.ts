import { Chain } from '@vultisig/core-chain/Chain'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'
import { useMemo } from 'react'

import { useCurrentVault } from './currentVault'

export const useAvailableChains = (): Chain[] => {
  const vault = useCurrentVault()

  return useMemo(() => {
    if (isKeyImportVault(vault)) {
      return getRecordKeys(shouldBePresent(vault.chainPublicKeys))
    }
    const allChains = Object.values(Chain)
    return vault.publicKeyMldsa
      ? allChains
      : allChains.filter(chain => getSignatureAlgorithm(chain) !== 'mldsa')
  }, [vault])
}
