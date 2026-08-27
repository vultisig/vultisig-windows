// @vitest-environment happy-dom

import { passcodeEncryptionStorage } from '@core/extension/storage/passcodeEncryption'
import { vaultsStorage } from '@core/extension/storage/vaults'
import { encryptSample } from '@core/ui/passcodeEncryption/core/sample'
import { encryptVaultAllKeyShares } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { EnterPasscode } from '@core/ui/passcodeEncryption/guard/EnterPasscode'
import {
  PasscodeProvider,
  usePasscode,
} from '@core/ui/passcodeEncryption/state/passcode'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('lottie-react', () => ({ default: () => null }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en', resolvedLanguage: 'en' },
    t: (key: string) => key,
  }),
  Trans: ({ children }: { children?: ReactNode }) => children ?? null,
}))

vi.mock('@core/ui/passcodeEncryption/manage/PasscodeInput', () => ({
  PasscodeInput: ({
    length,
    onChange,
    validation,
    value,
  }: {
    length: number
    onChange: (value: string | null) => void
    validation?: string
    value: string | null
  }) => (
    <input
      data-testid="passcode-input"
      data-length={length}
      data-validation={validation ?? ''}
      onChange={event => onChange(event.target.value || null)}
      value={value ?? ''}
    />
  ),
}))

const coreHolder: { value: Record<string, unknown> | undefined } = vi.hoisted(
  () => ({ value: undefined })
)

vi.mock('@core/ui/state/core', () => ({
  useCore: () => shouldBePresent(coreHolder.value),
}))

coreHolder.value = {
  ...vaultsStorage,
  ...passcodeEncryptionStorage,
}

const baseVault: Omit<Vault, 'keyShares'> = {
  name: 'Recovery Vault',
  publicKeys: { ecdsa: 'ecdsa-public-key', eddsa: 'eddsa-public-key' },
  signers: ['device-1'],
  hexChainCode: 'chain-code',
  localPartyId: 'device-1',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const PasscodeProbe = () => {
  const [passcode] = usePasscode()

  return <span data-testid="passcode-probe">{passcode ?? ''}</span>
}

const renderProofLossRecovery = async (
  passcode: string,
  { preserveProof = false }: { preserveProof?: boolean } = {}
) => {
  const encrypted = await encryptVaultAllKeyShares({
    keyShares: {
      ecdsa: 'ecdsa-share',
      eddsa: 'eddsa-share',
    },
    key: passcode,
  })

  await chrome.storage.local.set({
    [StorageKey.vaults]: [
      {
        ...baseVault,
        keyShares: encrypted.keyShares,
      },
    ],
  })
  const passcodeEncryption = preserveProof
    ? {
        encryptedSample: await encryptSample({
          key: passcode,
          value: 'sample',
        }),
        passcodeLength: passcode.length,
      }
    : null

  if (passcodeEncryption) {
    await passcodeEncryptionStorage.setPasscodeEncryption(passcodeEncryption)
  } else {
    await chrome.storage.local.remove(StorageKey.passcodeEncryption)
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData([StorageKey.passcodeEncryption], passcodeEncryption)

  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <PasscodeProvider initialValue={null}>
          <EnterPasscode />
          <PasscodeProbe />
        </PasscodeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )

  return screen.getByTestId<HTMLInputElement>('passcode-input')
}

const validationOf = (input: HTMLInputElement) =>
  input.getAttribute('data-validation')

describe('EnterPasscode proof-loss recovery', () => {
  it('waits for the full six-digit recovery code before verifying', async () => {
    const passcode = '135790'
    const input = await renderProofLossRecovery(passcode)

    expect(input.getAttribute('data-length')).toBe('6')

    fireEvent.change(input, { target: { value: passcode.slice(0, -1) } })
    expect(validationOf(input)).toBe('')

    fireEvent.change(input, { target: { value: passcode } })

    await waitFor(
      () =>
        expect(screen.getByTestId('passcode-probe').textContent).toBe(passcode),
      { timeout: 5_000 }
    )
  })

  it('charges the completed six-digit failure and persists throttling without a proof', async () => {
    const input = await renderProofLossRecovery('135790')

    fireEvent.change(input, { target: { value: '24680' } })
    expect(validationOf(input)).toBe('')

    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toBeNull()

    fireEvent.change(input, { target: { value: '246801' } })

    await waitFor(() => expect(validationOf(input)).toBe('invalid'), {
      timeout: 5_000,
    })

    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toEqual({
      encryptedSample: null,
      attemptState: {
        failedAttempts: 1,
        lastFailedAt: expect.any(Number),
      },
    })
  })

  it('unlocks a proofless legacy five-digit vault only after explicit submission', async () => {
    const passcode = '13579'
    const input = await renderProofLossRecovery(passcode)

    expect(input.getAttribute('data-length')).toBe('6')
    fireEvent.change(input, { target: { value: passcode } })
    expect(screen.getByTestId('passcode-probe').textContent).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'continue' }))

    await waitFor(
      () =>
        expect(screen.getByTestId('passcode-probe').textContent).toBe(passcode),
      { timeout: 5_000 }
    )
  })

  it('charges a failed explicit legacy recovery attempt', async () => {
    const input = await renderProofLossRecovery('13579')

    fireEvent.change(input, { target: { value: '54321' } })
    fireEvent.click(screen.getByRole('button', { name: 'continue' }))

    await waitFor(() => expect(validationOf(input)).toBe('invalid'), {
      timeout: 5_000,
    })
    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toEqual({
      encryptedSample: null,
      attemptState: {
        failedAttempts: 1,
        lastFailedAt: expect.any(Number),
      },
    })
  })
})
