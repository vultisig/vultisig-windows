import { TW } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { Tx } from '@vultisig/core-chain/tx'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const findTonGaslessTraceIdMock = vi.hoisted(() => vi.fn())

vi.mock('@vultisig/core-chain/chains/ton/gasless/request', () => ({
  isTonGaslessRequest: (boc: string) => boc === 'gasless-boc',
}))

vi.mock('./findTonGaslessTraceId', () => ({
  findTonGaslessTraceId: (bodyHash: string) =>
    findTonGaslessTraceIdMock(bodyHash),
}))

import { getKeysignTxHash } from './getKeysignTxHash'

const tonTx = (encoded: string): Tx<typeof Chain.Ton> => ({
  hash: 'body-hash',
  data: TW.TheOpenNetwork.Proto.SigningOutput.create({ encoded }),
})

describe('getKeysignTxHash', () => {
  beforeEach(() => {
    findTonGaslessTraceIdMock.mockReset()
  })

  it('uses the relay hash for a gasless TON request', async () => {
    await expect(
      getKeysignTxHash({
        chain: Chain.Ton,
        tx: tonTx('gasless-boc'),
        broadcastTxHash: 'external-hash',
      })
    ).resolves.toBe('external-hash')
    expect(findTonGaslessTraceIdMock).not.toHaveBeenCalled()
  })

  it('looks up the trace when a gasless broadcast fell back to the body hash', async () => {
    findTonGaslessTraceIdMock.mockResolvedValue('trace-id')

    await expect(
      getKeysignTxHash({
        chain: Chain.Ton,
        tx: tonTx('gasless-boc'),
        broadcastTxHash: 'body-hash',
      })
    ).resolves.toBe('trace-id')
    expect(findTonGaslessTraceIdMock).toHaveBeenCalledWith('body-hash')
  })

  it('looks up the trace when a gasless broadcast reported no hash', async () => {
    findTonGaslessTraceIdMock.mockResolvedValue('trace-id')

    await expect(
      getKeysignTxHash({ chain: Chain.Ton, tx: tonTx('gasless-boc') })
    ).resolves.toBe('trace-id')
  })

  it('keeps the body hash when the trace is not indexed', async () => {
    findTonGaslessTraceIdMock.mockResolvedValue(undefined)

    await expect(
      getKeysignTxHash({
        chain: Chain.Ton,
        tx: tonTx('gasless-boc'),
        broadcastTxHash: 'body-hash',
      })
    ).resolves.toBe('body-hash')
  })

  it('keeps the compiled hash for a direct TON send', async () => {
    await expect(
      getKeysignTxHash({
        chain: Chain.Ton,
        tx: tonTx('direct-boc'),
        broadcastTxHash: 'network-hash',
      })
    ).resolves.toBe('body-hash')
    expect(findTonGaslessTraceIdMock).not.toHaveBeenCalled()
  })

  it('keeps the compiled hash on other chains', async () => {
    await expect(
      getKeysignTxHash({
        chain: Chain.Solana,
        tx: {
          hash: 'compiled-signature',
          data: TW.Solana.Proto.SigningOutput.create({
            encoded: 'gasless-boc',
          }),
        },
        broadcastTxHash: 'network-signature',
      })
    ).resolves.toBe('compiled-signature')
    expect(findTonGaslessTraceIdMock).not.toHaveBeenCalled()
  })
})
