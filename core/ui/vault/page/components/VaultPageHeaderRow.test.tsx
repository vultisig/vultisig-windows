import { darkTheme } from '@lib/ui/theme/darkTheme'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { renderToString } from 'react-dom/server'
import { ServerStyleSheet, ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@core/ui/navigation/hooks/useCoreNavigate', () => ({
  useCoreNavigate: () => () => {},
}))

import { VaultPageHeaderRow } from './VaultPageHeaderRow'
import { VaultSelector } from './VaultSelector'

const vault: Vault = {
  name: 'android swap testing',
  publicKeys: { ecdsa: 'ecdsa-public-key', eddsa: 'eddsa-public-key' },
  signers: ['Mac-6001', 'Mac-6002'],
  localPartyId: 'Mac-6001',
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const renderHeader = () => {
  const sheet = new ServerStyleSheet()

  try {
    const html = renderToString(
      sheet.collectStyles(
        <ThemeProvider theme={darkTheme}>
          <VaultPageHeaderRow
            primaryControls={<button>dapps</button>}
            secondaryControls={<button>settings</button>}
            title={<VaultSelector placement="pageHeader" value={vault} />}
          />
        </ThemeProvider>
      )
    )

    return { css: sheet.getStyleTags().replace(/\s+/g, ''), html }
  } finally {
    sheet.seal()
  }
}

// At the narrowest supported extension side-panel width the vault name is the
// only element allowed to shrink, so it must ellipsize instead of running under
// the refresh, transaction history and settings controls.
describe('VaultPageHeaderRow', () => {
  it('lays controls out in flow with a shrinkable title column', () => {
    const { css } = renderHeader()

    expect(css).toContain('grid-template-columns:1frminmax(0,auto)1fr')
    expect(css).not.toContain('position:absolute')
  })

  it('ellipsizes a long vault name', () => {
    const { css, html } = renderHeader()

    expect(html).toContain('android swap testing')
    expect(css).toContain('text-overflow:ellipsis')
    expect(css).toContain('min-width:0')
  })
})
