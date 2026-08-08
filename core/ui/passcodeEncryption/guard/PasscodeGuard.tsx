import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { TakeWholeSpaceAbsolutely } from '@lib/ui/css/takeWholeSpaceAbsolutely'

import { usePasscodeAutoLock } from '../../storage/passcodeAutoLock'
import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { PasscodeAutoLock } from '../autoLock/PasscodeAutoLock'
import { usePasscodeUnlockSession } from '../autoLock/usePasscodeUnlockSession'
import { usePasscode } from '../state/passcode'
import { EnterPasscode } from './EnterPasscode'
import { PasscodeEncryptionUpgrade } from './PasscodeEncryptionUpgrade'

export const PasscodeGuard = () => {
  const [passcode] = usePasscode()

  const passcodeAutoLock = usePasscodeAutoLock()

  const hasPasscodeEnabled = useHasPasscodeEncryption()

  const { pendingPasscodeUnlockRestore } = usePasscodeUnlockSession({
    hasPasscodeEncryption: hasPasscodeEnabled,
    passcodeAutoLock,
  })

  const isLocked = hasPasscodeEnabled && !passcode

  return (
    <>
      {passcodeAutoLock && <PasscodeAutoLock />}
      {pendingPasscodeUnlockRestore && (
        <TakeWholeSpaceAbsolutely>
          <ProductLogoBlock />
        </TakeWholeSpaceAbsolutely>
      )}
      {isLocked && !pendingPasscodeUnlockRestore && (
        <>
          <TakeWholeSpaceAbsolutely>
            <EnterPasscode />
          </TakeWholeSpaceAbsolutely>
        </>
      )}
      {hasPasscodeEnabled && !isLocked && !pendingPasscodeUnlockRestore && (
        <PasscodeEncryptionUpgrade />
      )}
    </>
  )
}
