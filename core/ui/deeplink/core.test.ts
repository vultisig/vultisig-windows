import { create, toBinary } from '@bufbuild/protobuf'
import { KeysignMessageSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it, vi } from 'vitest'

import { parseDeeplink } from './core'

vi.mock('@core/ui/qr/utils/decompressQrPayload', () => ({
  decompressQrPayload: async () =>
    toBinary(KeysignMessageSchema, create(KeysignMessageSchema)),
}))

describe('parseDeeplink', () => {
  it('reads the vault of a keysign link', async () => {
    const parsed = await parseDeeplink(
      'https://vultisig.com?type=SignTransaction&vault=03abc&jsonData=x'
    )

    expect(parsed).toMatchObject({ signTransaction: { vaultId: '03abc' } })
  })

  it('rejects a keysign link without a vault', async () => {
    await expect(
      parseDeeplink('https://vultisig.com?type=SignTransaction&jsonData=x')
    ).rejects.toThrow('vault')
  })

  it('rejects a link without a payload', async () => {
    await expect(
      parseDeeplink('https://vultisig.com?type=SignTransaction&vault=03abc')
    ).rejects.toThrow('jsonData')
  })

  it('rejects a new vault link with an unknown tssType', async () => {
    await expect(
      parseDeeplink('https://vultisig.com?type=NewVault&tssType=Foo&jsonData=x')
    ).rejects.toThrow('Invalid deeplink tssType: Foo')
  })

  it('rejects send and deposit links without a chain', async () => {
    await expect(
      parseDeeplink('vultisig://send?assetTicker=ETH&toAddress=0xabc')
    ).rejects.toThrow('assetChain')
    await expect(
      parseDeeplink('https://vultisig.com?type=Deposit&memo=x')
    ).rejects.toThrow('assetChain')
  })

  const depositUrl = (query: string) =>
    `https://vultisig.com?type=Deposit&${query}`

  it('parses a THORChain deposit link, defaulting the ticker', async () => {
    expect(
      await parseDeeplink(
        depositUrl('assetChain=THORChain&memo=TCY%2B&amount=0.01')
      )
    ).toEqual({
      deposit: {
        chain: 'THORChain',
        ticker: 'RUNE',
        amount: '0.01',
        memo: 'TCY+',
      },
    })
  })

  it('parses a MayaChain deposit link on the app scheme, ignoring chain case', async () => {
    expect(
      await parseDeeplink(
        'vultisig://vultisig.com?type=Deposit&assetChain=mayachain&memo=x'
      )
    ).toMatchObject({
      deposit: { chain: 'MayaChain', ticker: 'CACAO', memo: 'x' },
    })
  })

  it('keeps an unencoded = in the memo', async () => {
    expect(
      await parseDeeplink(
        depositUrl('assetChain=THORChain&memo==:ETH.ETH:0xabc')
      )
    ).toMatchObject({ deposit: { memo: '=:ETH.ETH:0xabc' } })
  })

  it.each([
    ['a chain without a custom action', 'assetChain=Ethereum&memo=x'],
    ['a missing memo', 'assetChain=THORChain'],
    ['a blank memo', 'assetChain=THORChain&memo=%20'],
    ['a malformed amount', 'assetChain=THORChain&memo=x&amount=1e5'],
    ['a negative amount', 'assetChain=THORChain&memo=x&amount=-1'],
    [
      'a non-ticker assetTicker',
      'assetChain=THORChain&memo=x&assetTicker=a%20b',
    ],
  ])('rejects a deposit link with %s', async (_, query) => {
    await expect(parseDeeplink(depositUrl(query))).rejects.toThrow()
  })

  it('no longer parses the old vultisig://deposit host', async () => {
    await expect(
      parseDeeplink('vultisig://deposit?assetChain=THORChain&memo=x')
    ).rejects.toThrow()
  })

  it('does not route a send route embedded mid-link to the send flow', async () => {
    await expect(
      parseDeeplink(
        'vultisig://x/://send?type=SignTransaction&assetChain=Ethereum&toAddress=0xabc'
      )
    ).rejects.toThrow('jsonData')
  })
})
