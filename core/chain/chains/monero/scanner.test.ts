import { ed25519 } from '@noble/curves/ed25519'
import { describe, expect, it, vi } from 'vitest'

import * as daemonRpc from './daemonRpc'
import { MoneroScanData, setMoneroScanStorage } from './moneroScanStorage'
import {
  buildStoredOutputsFromWalletData,
  encodeMoneroOutputsWithAmounts,
  finaliseMoneroOutputsWithKeyImages,
  markMoneroOutputsSpent,
} from './scanner'

const privateSpendKeyHex =
  'ccf0ea10e1ea64354f42fa710c2b318e581969cf49046d809d1f0aadb3fc7a02'
const privateViewKeyHex =
  'a28b4b2085592881df94ee95da332c16b5bb773eb8bb74730208cbb236c73806'
const txExtraHex =
  '01d3ce2a622c6e06ed465f81017dd6188c3a6e3d8e65a846f9c98416da0e150a82020901c553d35e54111bd0'
const txOutputs = [
  {
    stealthPublicKeyHex:
      'ee8ca293511571c0005e1c144e49d09b8ff03046dbafb3e064a34cb9fc1994b6',
  },
  {
    stealthPublicKeyHex:
      '9e2e5cd08c8681dbcf2ce66071467e835f7e86613fbfed3c4fb170127b94e107',
  },
]
const ecdhInfo = [
  {
    mask: 'ce90e309ead2b487ec1d4d8af5d649543eb99a7620f6b54e532898527be29704',
    amount: 'f050e6f06de61e5967b2ddd506b4d6d36546065d6aae156ac7bec18c99580c07',
  },
  {
    mask: '867fb98cb29853edbafec91af2df605c12f9aaa81a9165625afb6649f5a65201',
    amount: '2c5ba6612351140e1fb4a8463cc765d0a9bb7d999ba35750f365c5285d77230b',
  },
]

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

const scalarFromLittleEndianHex = (hex: string): bigint => {
  const bytes = hexToBytes(hex)
  let scalar = BigInt(0)

  for (let i = bytes.length - 1; i >= 0; i--) {
    scalar = (scalar << BigInt(8)) + BigInt(bytes[i])
  }

  return scalar
}

const publicSpendKeyHex = toHex(
  ed25519.Point.BASE.multiply(
    scalarFromLittleEndianHex(privateSpendKeyHex)
  ).toRawBytes()
)

const createTx = ({
  hash,
  includeMetadata = true,
}: {
  hash: string
  includeMetadata?: boolean
}) => ({
  getHash: () => hash,
  getExtra: () => (includeMetadata ? hexToBytes(txExtraHex) : undefined),
  getOutputs: () =>
    includeMetadata
      ? txOutputs.map(output => ({
          getStealthPublicKey: () => output.stealthPublicKeyHex,
        }))
      : [],
  getRctSignatures: () => ({
    type: 1,
    ecdhInfo,
  }),
})

const createWalletOutput = ({
  outputKeyHex,
  hash,
  amount = 10000n,
  globalIndex = 0n,
  includeTxMetadata = false,
  spent = false,
}: {
  outputKeyHex: string
  hash: string
  amount?: bigint
  globalIndex?: bigint
  includeTxMetadata?: boolean
  spent?: boolean
}) => ({
  getTx: () => createTx({ hash, includeMetadata: includeTxMetadata }),
  getAmount: () => amount,
  getIndex: () => globalIndex,
  getStealthPublicKey: () => outputKeyHex,
  getIsSpent: () => spent,
  getIsFrozen: () => false,
  getIsLocked: () => false,
})

describe('markMoneroOutputsSpent', () => {
  it('marks stored outputs as spent and recomputes balance', async () => {
    let stored: MoneroScanData = {
      address: 'monero-address',
      publicKeyEcdsa: 'vault-pub',
      scanHeight: 100,
      scanTarget: 100,
      birthHeight: 0,
      birthdayScanDone: true,
      balance: '12',
      outputs: [
        {
          amount: '5',
          keyOffsetHex: '01'.repeat(32),
          outputKeyHex: 'aa'.repeat(32),
          commitmentMaskHex: '11'.repeat(32),
          globalIndex: '1',
          keyImageHex: '33'.repeat(32),
          spent: false,
        },
        {
          amount: '7',
          keyOffsetHex: '02'.repeat(32),
          outputKeyHex: 'bb'.repeat(32),
          commitmentMaskHex: '22'.repeat(32),
          globalIndex: '2',
          spent: false,
        },
      ],
    }

    setMoneroScanStorage({
      load: async () => stored,
      save: async data => {
        stored = data
      },
    })

    await markMoneroOutputsSpent({
      publicKeyEcdsa: 'vault-pub',
      spentOutputKeys: ['bb'.repeat(32)],
    })

    expect(stored.outputs?.map(output => output.spent)).toEqual([false, true])
    expect(stored.balance).toBe('5')
    expect(stored.totalOutputs).toBe(2)
    expect(stored.spentOutputs).toBe(1)
    expect(stored.spendDetectionMode).toBe('key-image+local')
  })
})

describe('buildStoredOutputsFromWalletData', () => {
  it('hydrates output tx metadata from wallet txs', () => {
    const result = buildStoredOutputsFromWalletData({
      walletOutputs: [
        createWalletOutput({
          outputKeyHex: txOutputs[0].stealthPublicKeyHex,
          hash: 'tx-1',
        }),
      ],
      walletTxs: [createTx({ hash: 'tx-1', includeMetadata: true })],
      existingOutputs: [],
      privateViewKeyHex,
      publicSpendKeyHex,
    })

    expect(result.unresolvedNewOutputCount).toBe(0)
    expect(result.outputs).toHaveLength(1)
    expect(result.outputs[0]).toMatchObject({
      amount: '10000',
      outputKeyHex: txOutputs[0].stealthPublicKeyHex,
      spent: false,
    })
  })

  it('reuses an existing stored output if tx metadata is unavailable', () => {
    const result = buildStoredOutputsFromWalletData({
      walletOutputs: [
        createWalletOutput({
          outputKeyHex: txOutputs[0].stealthPublicKeyHex,
          hash: 'tx-2',
          spent: true,
        }),
      ],
      walletTxs: [],
      existingOutputs: [
        {
          amount: '10000',
          keyOffsetHex:
            'f1d21a76ea0bb228fbc5f0dece0597a8ffb59de7a04b29f70b7c0310446ea905',
          outputKeyHex: txOutputs[0].stealthPublicKeyHex,
          commitmentMaskHex:
            '05c2f142aaf3054cbff0a022f6c7cb75403fd92af0f9441c072ade3f273f7706',
          globalIndex: '0',
          keyImageHex: '11'.repeat(32),
          spent: true,
        },
      ],
      privateViewKeyHex,
      publicSpendKeyHex,
    })

    expect(result.reusedStoredOutputs).toBe(1)
    expect(result.unresolvedNewOutputCount).toBe(0)
    expect(result.outputs).toEqual([
      {
        amount: '10000',
        keyOffsetHex:
          'f1d21a76ea0bb228fbc5f0dece0597a8ffb59de7a04b29f70b7c0310446ea905',
        outputKeyHex: txOutputs[0].stealthPublicKeyHex,
        commitmentMaskHex:
          '05c2f142aaf3054cbff0a022f6c7cb75403fd92af0f9441c072ade3f273f7706',
        globalIndex: '0',
        keyImageHex: '11'.repeat(32),
        spent: true,
        frozen: false,
        locked: false,
      },
    ])
  })

  it('does not trust view-only spent flags for newly scanned outputs', () => {
    const result = buildStoredOutputsFromWalletData({
      walletOutputs: [
        createWalletOutput({
          outputKeyHex: txOutputs[0].stealthPublicKeyHex,
          hash: 'tx-3',
          spent: true,
        }),
      ],
      walletTxs: [createTx({ hash: 'tx-3', includeMetadata: true })],
      existingOutputs: [],
      privateViewKeyHex,
      publicSpendKeyHex,
    })

    expect(result.outputs[0].spent).toBe(false)
    expect(result.outputs[0].keyImageHex).toBeUndefined()
  })

  it('keeps scanned outputs when full spend metadata cannot be derived', () => {
    const result = buildStoredOutputsFromWalletData({
      walletOutputs: [
        createWalletOutput({
          outputKeyHex: txOutputs[0].stealthPublicKeyHex,
          hash: 'tx-4',
        }),
      ],
      walletTxs: [
        {
          ...createTx({ hash: 'tx-4', includeMetadata: true }),
          getRctSignatures: () => undefined,
        },
      ],
      existingOutputs: [],
      privateViewKeyHex,
      publicSpendKeyHex,
    })

    expect(result.unresolvedNewOutputCount).toBe(0)
    expect(result.outputs).toHaveLength(1)
    expect(result.outputs[0]).toMatchObject({
      amount: '10000',
      outputKeyHex: txOutputs[0].stealthPublicKeyHex,
      keyOffsetHex:
        'f1d21a76ea0bb228fbc5f0dece0597a8ffb59de7a04b29f70b7c0310446ea905',
      spent: false,
    })
    expect(result.outputs[0].commitmentMaskHex).toBeUndefined()
  })
})

describe('finaliseMoneroOutputsWithKeyImages', () => {
  it('stores key images, marks spent outputs, and recomputes balance', async () => {
    let stored: MoneroScanData = {
      address: 'monero-address',
      publicKeyEcdsa: 'vault-pub',
      scanHeight: 100,
      scanTarget: 100,
      birthHeight: 0,
      birthdayScanDone: true,
      balance: '12',
      outputs: [
        {
          amount: '5',
          keyOffsetHex: '01'.repeat(32),
          outputKeyHex: 'aa'.repeat(32),
          commitmentMaskHex: '11'.repeat(32),
          globalIndex: '1',
          spent: false,
        },
        {
          amount: '7',
          keyOffsetHex: '02'.repeat(32),
          outputKeyHex: 'bb'.repeat(32),
          commitmentMaskHex: '22'.repeat(32),
          globalIndex: '2',
          spent: false,
        },
      ],
    }

    setMoneroScanStorage({
      load: async () => stored,
      save: async data => {
        stored = data
      },
    })

    const rpcSpy = vi
      .spyOn(daemonRpc, 'isKeyImageSpent')
      .mockResolvedValue([false, true])

    const outputs = stored.outputs!.map(({ amount, outputKeyHex }) => ({
      amount,
      outputKeyHex,
    }))
    const outputsData = encodeMoneroOutputsWithAmounts(stored.outputs!)
    const keyImages = new Uint8Array(64)
    keyImages.fill(1, 0, 32)
    keyImages.fill(2, 32, 64)

    const result = await finaliseMoneroOutputsWithKeyImages({
      publicKeyEcdsa: 'vault-pub',
      outputs,
      outputsData,
      keyImages,
    })

    expect(rpcSpy).toHaveBeenCalledWith(['01'.repeat(32), '02'.repeat(32)])
    expect(result).toEqual({
      checkedOutputs: 2,
      spentOutputs: 1,
      unspentOutputs: 1,
      balance: '5',
    })
    expect(stored.outputs?.[0]).toMatchObject({
      keyImageHex: '01'.repeat(32),
      spent: false,
    })
    expect(stored.outputs?.[1]).toMatchObject({
      keyImageHex: '02'.repeat(32),
      spent: true,
    })
    expect(stored.balance).toBe('5')
    expect(stored.spendDetectionMode).toBe('key-image+local')

    rpcSpy.mockRestore()
  })
})
