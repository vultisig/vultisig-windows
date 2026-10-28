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
})
