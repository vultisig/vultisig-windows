import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { ChildrenProp } from '@lib/ui/props'
import styled, { createGlobalStyle } from 'styled-components'

import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { useAutoLock } from '../autoLock/core/autoLock'
import { usePasscode } from '../state/passcode'
import { EnterPasscode } from './EnterPasscode'

const PasscodeOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  ${takeWholeSpace}
  z-index: 9999;
`

const HideScrollbars = createGlobalStyle`
  * {
    ${hideScrollbars}
  }
`

export const PasscodeGuard = ({ children }: ChildrenProp) => {
  const [passcode] = usePasscode()

  useAutoLock()

  const hasPasscodeEnabled = useHasPasscodeEncryption()

  const isLocked = hasPasscodeEnabled && !passcode

  return (
    <>
      {children}
      {isLocked && (
        <>
          <HideScrollbars />
          <PasscodeOverlay>
            <EnterPasscode />
          </PasscodeOverlay>
        </>
      )}
    </>
  )
}
