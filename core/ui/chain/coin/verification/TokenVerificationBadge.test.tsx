import { darkTheme } from '@lib/ui/theme/darkTheme'
import { Chain } from '@vultisig/core-chain/Chain'
import { renderToString } from 'react-dom/server'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { TokenVerificationPill } from './TokenVerificationPill'
import { isVerifiableToken } from './useTokenVerificationQuery'

const render = (node: React.ReactElement) =>
  renderToString(<ThemeProvider theme={darkTheme}>{node}</ThemeProvider>)

describe('TokenVerificationPill', () => {
  it('renders nothing for a verified token so the absence of a label stays meaningful', () => {
    expect(render(<TokenVerificationPill value="verified" />)).toBe('')
  })

  it('labels unverified and scam tokens', () => {
    const unverified = render(<TokenVerificationPill value="unverified" />)
    expect(unverified).toContain('token_verification_unverified')
    expect(unverified).toContain('data-testid="token-verification-unverified"')

    const scam = render(<TokenVerificationPill value="scam" />)
    expect(scam).toContain('token_verification_scam')
    expect(scam).toContain('data-testid="token-verification-scam"')
  })
})

describe('isVerifiableToken', () => {
  it('applies to TON jettons only, never to the TON fee coin or other chains', () => {
    expect(
      isVerifiableToken({
        chain: Chain.Ton,
        id: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        ticker: 'USDT',
      })
    ).toBe(true)
    expect(isVerifiableToken({ chain: Chain.Ton, ticker: 'TON' })).toBe(false)
    expect(
      isVerifiableToken({
        chain: Chain.Ethereum,
        id: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        ticker: 'USDC',
      })
    ).toBe(false)
  })
})
