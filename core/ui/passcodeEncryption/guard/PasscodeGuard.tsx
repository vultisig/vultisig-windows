import { TakeWholeSpaceAbsolutely } from '@lib/ui/css/takeWholeSpaceAbsolutely'

import { usePasscodeAutoLock } from '../../storage/passcodeAutoLock'
import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { PasscodeAutoLock } from '../autoLock/PasscodeAutoLock'
import { usePasscode } from '../state/passcode'
import { EnterPasscode } from './EnterPasscode'

export const PasscodeGuard = () => {
  const [passcode] = usePasscode()

  const passcodeAutoLock = usePasscodeAutoLock()

  const hasPasscodeEnabled = useHasPasscodeEncryption()

  const isLocked = hasPasscodeEnabled && !passcode

  return (
    <>
      {passcodeAutoLock && <PasscodeAutoLock />}
      {isLocked && (
        <>
          <TakeWholeSpaceAbsolutely>
            <EnterPasscode />
          </TakeWholeSpaceAbsolutely>
        </>
      )}
    </>
  )
}
