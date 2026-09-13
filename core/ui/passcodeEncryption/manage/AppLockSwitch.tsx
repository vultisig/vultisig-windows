import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { VStack } from '@lib/ui/layout/Stack'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

import { useDisablePasscodeMutation } from '../mutations/useDisablePasscodeMutation'
import { useIsPasscodeRequired } from '../state/useIsPasscodeRequired'
import { ChangePasscode } from './change/ChangePasscode'
import { EnablePasscodeInput } from './EnablePasscodeInput'
import { SetPasscodeForm } from './SetPasscodeForm'

/**
 * The App Lock row: one switch that owns both directions of the passcode
 * setting, plus whatever belongs under it for the current state.
 *
 * Enabling and disabling used to live in two sibling components that replaced
 * each other, so the switch was destroyed and rebuilt on every transition and
 * jumped between positions instead of sliding. Keeping a single switch mounted
 * here — reading the stored state rather than a hardcoded value — lets it
 * animate the way an ordinary toggle does.
 */
export const AppLockSwitch = () => {
  const hasPasscodeEnabled = useIsPasscodeRequired()
  const [isSettingPasscode, { set: openSetPasscode, unset: closeSetPasscode }] =
    useBoolean(false)

  const {
    mutate: disablePasscode,
    isPending: isDisabling,
    error: disableError,
  } = useDisablePasscodeMutation()

  const isOn = hasPasscodeEnabled || isSettingPasscode

  return (
    <VStack gap={22}>
      <VStack gap={14}>
        <EnablePasscodeInput
          value={isOn}
          onChange={() => {
            // A second toggle while the first is still running would race it.
            // Ignored here rather than by disabling the switch, so the control
            // keeps sliding normally instead of greying out mid-transition.
            if (isDisabling) {
              return
            }

            if (hasPasscodeEnabled) {
              disablePasscode()
              return
            }

            if (isSettingPasscode) {
              closeSetPasscode()
            } else {
              openSetPasscode()
            }
          }}
          errorMessage={
            disableError ? extractErrorMsg(disableError) : undefined
          }
        />
        {!hasPasscodeEnabled && isSettingPasscode && (
          <SetPasscodeForm onSuccess={closeSetPasscode} />
        )}
      </VStack>
      {hasPasscodeEnabled && !isDisabling && <ChangePasscode />}
    </VStack>
  )
}
