import { PolkadotSignerPayloadJSON } from '@core/ui/polkadot/dapp/PolkadotSignerPayload'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { describe, expect, it } from 'vitest'

import { getTxAmount } from './amount'
import { ParsedTx } from './parsedTx'

const aliceAccountIdHex =
  'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'

// balances(5).transfer_allow_death(0), MultiAddress::Id(0) Alice, then 1 TAO
// (1e9 rao) as a four-byte compact.
const oneTaoTransferMethod = `0x050000${aliceAccountIdHex}02286bee`

const signerPayload = (method: string): PolkadotSignerPayloadJSON => ({
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  blockHash: `0x${'11'.repeat(32)}`,
  blockNumber: '0x00000001',
  era: '0x00',
  genesisHash:
    '0x2f0555cc76fc2840a25a6ea3b9637146806f1f44b090c175ffde2a7e5ab36c03',
  method,
  nonce: '0x00000000',
  specVersion: '0x000000e2',
  tip: '0x00000000',
  transactionVersion: '0x00000001',
  signedExtensions: [],
  version: 4,
})

const parsedTx = (method: string): ParsedTx => ({
  coin: {
    ...chainFeeCoin[OtherChain.Bittensor],
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  },
  customTxData: {
    polkadot: {
      chain: OtherChain.Bittensor,
      signerPayload: signerPayload(method),
    },
  },
})

describe('getTxAmount for a Substrate dApp transaction', () => {
  it('reports the value the signed call actually moves', () => {
    expect(getTxAmount(parsedTx(oneTaoTransferMethod))).toBe(1_000_000_000n)
  })

  it('reports no amount for a call that carries no transfer value', () => {
    // system.remark — nothing about it is a transfer, so there is no scalar to
    // review. An empty amount renders no row; a zero would assert a value the
    // signed bytes do not contain, which is the bug this covers.
    expect(getTxAmount(parsedTx('0x000048656c6c6f'))).toBe('')
  })

  it('fails closed when a transfer call does not decode', () => {
    const truncated = `0x050000${aliceAccountIdHex.slice(0, 20)}`

    expect(() => getTxAmount(parsedTx(truncated))).toThrow()
  })
})
