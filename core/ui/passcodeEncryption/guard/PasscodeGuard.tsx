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

  const isLocked = hasPasscodeEnabled && !passcode

  useClearSigningCredentialsOnLock(isLocked)

  return (
    <>
      {passcodeAutoLock && <PasscodeAutoLock />}
      {pendingPasscodeUnlockRestore && (
        <BlockingOverlay>
          <StartupPlaceholder />
        </BlockingOverlay>
      )}
      {isLocked && !pendingPasscodeUnlockRestore && (
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
