import { ChildrenProp } from '@lib/ui/props'

import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { useAutoLock } from '../autoLock/core/autoLock'
import { usePasscode } from '../state/passcode'
import { EnterPasscode } from './EnterPasscode'

export const PasscodeGuard = ({ children }: ChildrenProp) => {
  const [passcode] = usePasscode()

  useAutoLock()

  const hasPasscodeEnabled = useHasPasscodeEncryption()

  const isLocked = hasPasscodeEnabled && !passcode

  return isLocked ? <EnterPasscode /> : <>{children}</>
}
