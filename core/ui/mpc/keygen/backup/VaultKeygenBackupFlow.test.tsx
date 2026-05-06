import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../vault/backup/fast/BackupFastVault', () => ({
  BackupFastVault: () =>
    createElement('div', { 'data-testid': 'backup-fast-vault' }),
}))

vi.mock('../../../vault/backup/secure/BackupSecureVault', () => ({
  BackupSecureVault: () =>
    createElement('div', { 'data-testid': 'backup-secure-vault' }),
}))

import { VaultKeygenBackupFlow } from './VaultKeygenBackupFlow'

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

const renderWithVault = (vault: Vault) =>
  renderToStaticMarkup(
    <CurrentVaultProvider value={vault}>
      <VaultKeygenBackupFlow onFinish={() => {}} onBack={() => {}} />
    </CurrentVaultProvider>
  )

describe('VaultKeygenBackupFlow', () => {
  it('renders BackupFastVault when vault has a server signer and local party is not the server', () => {
    const html = renderWithVault(
      createMinimalVault({
        signers: ['Mac-6001', 'Server-6002'],
        localPartyId: 'Mac-6001',
      })
    )

    expect(html).toContain('data-testid="backup-fast-vault"')
    expect(html).not.toContain('data-testid="backup-secure-vault"')
  })

  it('renders BackupSecureVault when local party is the server (imported server share holder)', () => {
    const html = renderWithVault(
      createMinimalVault({
        signers: ['Mac-6001', 'Server-6002'],
        localPartyId: 'Server-6002',
      })
    )

    expect(html).toContain('data-testid="backup-secure-vault"')
    expect(html).not.toContain('data-testid="backup-fast-vault"')
  })

  it('renders BackupSecureVault when there is no server signer (DKLS secure vault)', () => {
    const html = renderWithVault(
      createMinimalVault({
        signers: ['Mac-6001', 'Mac-6002'],
        localPartyId: 'Mac-6001',
      })
    )

    expect(html).toContain('data-testid="backup-secure-vault"')
    expect(html).not.toContain('data-testid="backup-fast-vault"')
  })
})
