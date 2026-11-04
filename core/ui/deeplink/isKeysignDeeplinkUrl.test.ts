import { describe, expect, it } from 'vitest'

import { isKeysignDeeplinkUrl } from './isKeysignDeeplinkUrl'

describe('isKeysignDeeplinkUrl', () => {
  it.each([
    'https://vultisig.com?type=SignTransaction&vault=03abc&jsonData=x',
    'vultisig://vultisig.com?type=SignTransaction&vault=03abc&jsonData=x',
  ])('accepts the keysign link %s', url => {
    expect(isKeysignDeeplinkUrl(url)).toBe(true)
  })

  it.each([
    'https://vultisig.com?type=Deposit&assetChain=THORChain&memo=x',
    'https://vultisig.com?type=NewVault&tssType=Keygen&jsonData=x',
    'vultisig://send?assetChain=Ethereum&assetTicker=ETH&toAddress=0xabc',
    'vultisig://send?type=SignTransaction&assetChain=Ethereum&toAddress=0xabc',
    'https://vultisig.com',
    '',
  ])('rejects %s', url => {
    expect(isKeysignDeeplinkUrl(url)).toBe(false)
  })
})
