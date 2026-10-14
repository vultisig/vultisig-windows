import { describe, expect, it } from 'vitest'

import { isDeeplinkUrl } from './isDeeplinkUrl'

describe('isDeeplinkUrl', () => {
  it('recognizes the send link the mobile apps put in a QR (#5149)', () => {
    expect(
      isDeeplinkUrl(
        'vultisig://send?assetChain=Ethereum&assetTicker=ETH&toAddress=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&amount=0.001'
      )
    ).toBe(true)
  })

  it('recognizes web links', () => {
    expect(
      isDeeplinkUrl('https://vultisig.com?type=NewVault&tssType=Keygen')
    ).toBe(true)
  })

  it('leaves bare wallet addresses to chain detection', () => {
    expect(isDeeplinkUrl('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(
      false
    )
    expect(isDeeplinkUrl('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(
      false
    )
  })
})
