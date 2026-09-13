// @vitest-environment happy-dom
/**
 * Lifecycle boundaries of the App Lock row.
 *
 * `AppLockSwitch` owns both passcode mutations so the switch can stay mounted
 * across a transition. That ownership creates two failure modes the component
 * has to handle itself, neither of which the mutation-level tests can see:
 *
 * - the set-passcode mutation keeps running if the switch is toggled
 *   mid-flight, and would enable App Lock after a click that asked for the
 *   opposite, so toggles are ignored while it is pending;
 * - the mutation now outlives the form it belongs to, so a failed attempt
 *   would still be on screen when the form is reopened unless it is reset.
 */
import { AppLockSwitch } from '@core/ui/passcodeEncryption/manage/AppLockSwitch'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { fireEvent, render as baseRender, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = (ui: ReactNode) =>
  baseRender(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

// The change-passcode panel is a modal with its own mutation; out of scope.
vi.mock('@core/ui/passcodeEncryption/manage/change/ChangePasscode', () => ({
  ChangePasscode: () => null,
}))

const isPasscodeRequired = vi.hoisted(() => vi.fn(() => false))
vi.mock('@core/ui/passcodeEncryption/state/useIsPasscodeRequired', () => ({
  useIsPasscodeRequired: () => isPasscodeRequired(),
}))

const setPasscode = vi.hoisted(() => vi.fn())
const resetSetPasscode = vi.hoisted(() => vi.fn())
const setPasscodeState = vi.hoisted(() => ({
  isPending: false,
  error: null as Error | null,
}))

vi.mock('@core/ui/passcodeEncryption/mutations/useSetPasscodeMutation', () => ({
  useSetPasscodeMutation: () => ({
    mutate: setPasscode,
    isPending: setPasscodeState.isPending,
    error: setPasscodeState.error,
    reset: resetSetPasscode,
  }),
}))

const disablePasscode = vi.hoisted(() => vi.fn())
vi.mock(
  '@core/ui/passcodeEncryption/mutations/useDisablePasscodeMutation',
  () => ({
    useDisablePasscodeMutation: () => ({
      mutate: disablePasscode,
      isPending: false,
      error: null,
    }),
  })
)

const toggle = () => {
  fireEvent.click(screen.getByText(/^(on|off)$/i))
}

const openSetPasscodeForm = () => {
  toggle()
  expect(screen.getByText('set_passcode')).toBeTruthy()
}

beforeEach(() => {
  vi.clearAllMocks()
  isPasscodeRequired.mockReturnValue(false)
  setPasscodeState.isPending = false
  setPasscodeState.error = null
})

describe('App Lock switch, while a passcode is being set', () => {
  it('ignores a toggle while the mutation is still running', () => {
    const { rerender } = render(<AppLockSwitch />)
    openSetPasscodeForm()

    // The mutation is in flight: sealing the shares continues no matter what
    // the switch does, so acting on the toggle would contradict the write.
    setPasscodeState.isPending = true
    rerender(
      <ThemeProvider theme={darkTheme}>
        <AppLockSwitch />
      </ThemeProvider>
    )

    toggle()

    expect(screen.getByText('set_passcode')).toBeTruthy()
    expect(setPasscode).not.toHaveBeenCalled()
    expect(disablePasscode).not.toHaveBeenCalled()
  })

  it('acts on the toggle again once the mutation settles', () => {
    const { rerender } = render(<AppLockSwitch />)
    openSetPasscodeForm()

    setPasscodeState.isPending = true
    rerender(
      <ThemeProvider theme={darkTheme}>
        <AppLockSwitch />
      </ThemeProvider>
    )
    toggle()

    setPasscodeState.isPending = false
    rerender(
      <ThemeProvider theme={darkTheme}>
        <AppLockSwitch />
      </ThemeProvider>
    )
    toggle()

    expect(screen.queryByText('set_passcode')).toBeNull()
  })

  it('drops a failed attempt when the form is dismissed', () => {
    const { rerender } = render(<AppLockSwitch />)
    openSetPasscodeForm()

    setPasscodeState.error = new Error('sealing failed')
    rerender(
      <ThemeProvider theme={darkTheme}>
        <AppLockSwitch />
      </ThemeProvider>
    )
    expect(screen.getByText('sealing failed')).toBeTruthy()

    toggle()
    expect(resetSetPasscode).toHaveBeenCalled()

    // `reset` is what clears the mutation; the component must call it, and the
    // reopened form must not carry the previous failure.
    setPasscodeState.error = null
    rerender(
      <ThemeProvider theme={darkTheme}>
        <AppLockSwitch />
      </ThemeProvider>
    )
    toggle()

    expect(screen.getByText('set_passcode')).toBeTruthy()
    expect(screen.queryByText('sealing failed')).toBeNull()
  })
})

describe('App Lock switch, with a passcode already set', () => {
  it('disables the passcode rather than opening the setup form', () => {
    isPasscodeRequired.mockReturnValue(true)
    render(<AppLockSwitch />)

    toggle()

    expect(disablePasscode).toHaveBeenCalledOnce()
    expect(screen.queryByText('set_passcode')).toBeNull()
  })
})
