import { Chain } from '@vultisig/core-chain/Chain'
import { Tx } from '@vultisig/core-chain/tx'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@vultisig/core-chain/chains/ton/gasless/request', () => ({
  isTonGaslessRequest: (boc: string) => boc === 'gasless-boc',
}))

import { getKeysignTxHash } from './getKeysignTxHash'

const tonTx = (encoded: string) =>
  ({ hash: 'body-hash', data: { encoded } }) as unknown as Tx

describe('getKeysignTxHash', () => {
  it('uses the relay hash for a gasless TON request', () => {
    expect(
      getKeysignTxHash({
        chain: Chain.Ton,
        tx: tonTx('gasless-boc'),
        broadcastTxHash: 'external-hash',
      })
    ).toBe('external-hash')
  })

  it('keeps the compiled hash for a direct TON send', () => {
    expect(
      getKeysignTxHash({
        chain: Chain.Ton,
        tx: tonTx('direct-boc'),
        broadcastTxHash: 'network-hash',
      })
    ).toBe('body-hash')
  })

  it('keeps the compiled hash on other chains', () => {
    expect(
      getKeysignTxHash({
        chain: Chain.Ethereum,
        tx: {
          hash: '0xcompiled',
          data: { encoded: 'gasless-boc' },
        } as unknown as Tx,
        broadcastTxHash: '0xnetwork',
      })
    ).toBe('0xcompiled')
  })
})
