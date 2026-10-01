import { StartupPlaceholder } from '@core/ui/product/StartupPlaceholder'
import { BlockingOverlay } from '@lib/ui/overlay/BlockingOverlay'

import { usePasscodeAutoLock } from '../../storage/passcodeAutoLock'
import { PasscodeAutoLock } from '../autoLock/PasscodeAutoLock'
import { usePasscodeUnlockSession } from '../autoLock/usePasscodeUnlockSession'
import { usePasscode } from '../state/passcode'
import { useIsPasscodeRequired } from '../state/useIsPasscodeRequired'
import { EnterPasscode } from './EnterPasscode'
import { PasscodeEncryptionUpgrade } from './PasscodeEncryptionUpgrade'
import { useClearSigningCredentialsOnLock } from './useClearSigningCredentialsOnLock'

export const PasscodeGuard = () => {
  const [passcode] = usePasscode()

  const passcodeAutoLock = usePasscodeAutoLock()

  const hasPasscodeEnabled = useIsPasscodeRequired()

  const { pendingPasscodeUnlockRestore } = usePasscodeUnlockSession({
    hasPasscodeEncryption: hasPasscodeEnabled,
    passcodeAutoLock,
  })

  // The passcode state starts empty on every mount, so while an unlock session
  // is being restored the app is not known to be locked. Treating it as locked
  // would clear the cached fast-vault password on every popup open.
  const isLocked =
    hasPasscodeEnabled && !passcode && !pendingPasscodeUnlockRestore

  useClearSigningCredentialsOnLock(isLocked)

  return (
    <>
      {passcodeAutoLock && <PasscodeAutoLock />}
      {pendingPasscodeUnlockRestore && (
        <BlockingOverlay>
          <StartupPlaceholder />
        </BlockingOverlay>
      )}
      {isLocked && (
        <BlockingOverlay>
          <EnterPasscode />
        </BlockingOverlay>
      )}
      {hasPasscodeEnabled && !isLocked && !pendingPasscodeUnlockRestore && (
        <PasscodeEncryptionUpgrade />
      )}
    </>
  )
}
