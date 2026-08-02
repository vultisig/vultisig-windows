import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { createElement, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./fast/SaveBackupToCloudScreen', () => ({
  SaveBackupToCloudScreen: () =>
    createElement('div', { 'data-testid': 'save-backup-screen' }),
}))

vi.mock('./VaultBackupFlow', () => ({
  VaultBackupFlow: ({ vaultIds }: { vaultIds: string[] }) =>
    createElement('div', {
      'data-testid': 'vault-backup-flow',
      'data-vault-ids': vaultIds.join(','),
    }),
}))

// Both steps are rendered at once so the second one can be asserted without a
// DOM to click through the transition.
vi.mock('@lib/ui/base/StepTransition', () => ({
  StepTransition: ({
    from,
    to,
  }: {
    from: (props: { onFinish: () => void }) => ReactNode
    to: (props: { onBack: () => void }) => ReactNode
  }) =>
    createElement(
      'div',
      null,
      from({ onFinish: () => {} }),
      to({ onBack: () => {} })
    ),
}))

import { InitiateVaultShareBackup } from './InitiateVaultShareBackup'

const vault: Vault = {
  name: 'Test vault',
  publicKeys: { ecdsa: 'ecdsa-public-key', eddsa: 'eddsa-public-key' },
  signers: ['Mac-6001', 'Mac-6002'],
  localPartyId: 'Mac-6001',
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
  libType: 'DKLS',
  isBackedUp: false,
  order: 0,
}

const html = renderToStaticMarkup(
  <CurrentVaultProvider value={vault}>
    <InitiateVaultShareBackup onFinish={() => {}} onBack={() => {}} />
  </CurrentVaultProvider>
)

describe('InitiateVaultShareBackup', () => {
  it('offers the password options for the current vault', () => {
    expect(html).toContain('data-testid="vault-backup-flow"')
    expect(html).toContain(`data-vault-ids="${vault.publicKeys.ecdsa}"`)
  })

  it('asks for the password options only after the save backup screen', () => {
    expect(html.indexOf('data-testid="save-backup-screen"')).toBeLessThan(
      html.indexOf('data-testid="vault-backup-flow"')
    )
  })
})
