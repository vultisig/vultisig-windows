import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

vi.mock('@core/ui/mpc/keygen/mutations/useKeygenMutation', () => ({
  useKeygenMutation: vi.fn(),
}))

vi.mock('@core/ui/mpc/keygen/state/currentKeygenOperationType', () => ({
  useKeygenOperation: () => ({ create: true }),
}))

vi.mock('@core/ui/vault/save/SaveVaultStep', () => ({
  SaveVaultStep: () =>
    createElement('div', { 'data-testid': 'save-vault-step' }),
}))

vi.mock('./KeygenFlowEnding', () => ({
  KeygenFlowEnding: () =>
    createElement('div', { 'data-testid': 'keygen-flow-ending' }),
}))

import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'

import { KeygenFlow } from './KeygenFlow'

const createMinimalVault = (input: {
  signers: string[]
  localPartyId: string
}): Vault => ({
  name: 'Test vault',
  publicKeys: { ecdsa: 'ecdsa-placeholder', eddsa: 'eddsa-placeholder' },
  signers: input.signers,
  localPartyId: input.localPartyId,
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
  libType: 'DKLS',
  isBackedUp: false,
  order: 0,
})

describe('KeygenFlow save ordering before backup', () => {
  beforeEach(() => {
    vi.mocked(useKeygenMutation).mockReset()
  })

  it('skips SaveVaultStep before ending when post-keygen backup uses the fast path', () => {
    const vault = createMinimalVault({
      signers: ['Mac-6001', 'Server-6002'],
      localPartyId: 'Mac-6001',
    })
    vi.mocked(useKeygenMutation).mockReturnValue({
      step: null,
      protocolStatuses: {},
      mutate: vi.fn(),
      data: vault,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
    } as unknown as ReturnType<typeof useKeygenMutation>)

    const html = renderToStaticMarkup(<KeygenFlow onBack={() => {}} />)

    expect(html).toContain('data-testid="keygen-flow-ending"')
    expect(html).not.toContain('data-testid="save-vault-step"')
  })

  it('runs SaveVaultStep before ending for imported server-share holder (secure backup)', () => {
    const vault = createMinimalVault({
      signers: ['Mac-6001', 'Server-6002'],
      localPartyId: 'Server-6002',
    })
    vi.mocked(useKeygenMutation).mockReturnValue({
      step: null,
      protocolStatuses: {},
      mutate: vi.fn(),
      data: vault,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
    } as unknown as ReturnType<typeof useKeygenMutation>)

    const html = renderToStaticMarkup(<KeygenFlow onBack={() => {}} />)

    expect(html).toContain('data-testid="save-vault-step"')
    expect(html).not.toContain('data-testid="keygen-flow-ending"')
  })

  it('runs SaveVaultStep before ending when there is no server signer', () => {
    const vault = createMinimalVault({
      signers: ['Mac-6001', 'Mac-6002'],
      localPartyId: 'Mac-6001',
    })
    vi.mocked(useKeygenMutation).mockReturnValue({
      step: null,
      protocolStatuses: {},
      mutate: vi.fn(),
      data: vault,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
    } as unknown as ReturnType<typeof useKeygenMutation>)

    const html = renderToStaticMarkup(<KeygenFlow onBack={() => {}} />)

    expect(html).toContain('data-testid="save-vault-step"')
  })
})
