import { usePasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { useVaults } from '@core/ui/storage/vaults'

import { isPasscodeRequired } from '../core/passcodeLock'

/** Reads {@link isPasscodeRequired} off the stored vaults and passcode proof. */
export const useIsPasscodeRequired = () => {
  const passcodeEncryption = usePasscodeEncryption()
  const vaults = useVaults()

  return isPasscodeRequired({
    vaults,
    encryptedSample: passcodeEncryption?.encryptedSample ?? null,
  })
}
