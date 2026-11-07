import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'
import { isRecordOnChain } from './isRecordOnChain'

const base = {
  id: 'record-1',
  vaultId: 'vault-1',
  timestamp: new Date().toISOString(),
  txHash: '0xhash',
  explorerUrl: '',
  fiatValue: '',
  status: 'confirmed' as const,
}

const ethToBtc: SwapTransactionRecord['data'] = {
  fromToken: 'ETH',
  fromAmount: '1',
  fromChain: Chain.Ethereum,
  fromDecimals: 18,
  fromTokenLogo: '',
  toToken: 'BTC',
  toAmount: '0.05',
  toDecimals: 8,
  toTokenLogo: '',
  toChain: Chain.Bitcoin,
}

const btcSend: SendTransactionRecord = {
  ...base,
  type: 'send',
  chain: Chain.Bitcoin,
  data: {
    fromAddress: 'bc1from',
    toAddress: 'bc1to',
    amount: '1',
    token: 'BTC',
    tokenLogo: '',
    decimals: 8,
  },
}

const chainsListing = (record: TransactionRecord, chains: Chain[]) =>
  chains.filter(chain => isRecordOnChain({ record, chain }))

describe('isRecordOnChain', () => {
  it('lists an aggregator ETH to BTC swap on both coin chains', () => {
    const record: TransactionRecord = {
      ...base,
      type: 'swap',
      chain: Chain.Ethereum,
      data: ethToBtc,
    }

    expect(
      chainsListing(record, [Chain.Ethereum, Chain.Bitcoin, Chain.Solana])
    ).toEqual([Chain.Ethereum, Chain.Bitcoin])
  })

  it('lists a native swap filed under THORChain on the coin chains, not on THORChain', () => {
    const record: TransactionRecord = {
      ...base,
      type: 'swap',
      chain: Chain.THORChain,
      data: ethToBtc,
    }

    expect(
      chainsListing(record, [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain])
    ).toEqual([Chain.Ethereum, Chain.Bitcoin])
  })

  it('lists a RUNE swap on THORChain, where its source coin is', () => {
    const record: TransactionRecord = {
      ...base,
      type: 'swap',
      chain: Chain.THORChain,
      data: { ...ethToBtc, fromToken: 'RUNE', fromChain: Chain.THORChain },
    }

    expect(
      chainsListing(record, [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain])
    ).toEqual([Chain.Bitcoin, Chain.THORChain])
  })

  it('lists a same-chain swap once on its chain', () => {
    const record: TransactionRecord = {
      ...base,
      type: 'swap',
      chain: Chain.Ethereum,
      data: { ...ethToBtc, toToken: 'USDC', toChain: Chain.Ethereum },
    }

    expect(chainsListing(record, [Chain.Ethereum, Chain.Bitcoin])).toEqual([
      Chain.Ethereum,
    ])
  })

  it('lists a plain BTC send only on Bitcoin', () => {
    expect(
      chainsListing(btcSend, [Chain.Bitcoin, Chain.Ethereum, Chain.THORChain])
    ).toEqual([Chain.Bitcoin])
  })

  it("scopes the vault's stored rows without adding one for the destination", () => {
    const swap: TransactionRecord = {
      ...base,
      id: 'swap',
      type: 'swap',
      chain: Chain.THORChain,
      data: ethToBtc,
    }
    const records = [swap, btcSend]

    const listedOn = (chain: Chain) =>
      records.filter(record => isRecordOnChain({ record, chain }))

    expect(listedOn(Chain.Bitcoin)).toEqual([swap, btcSend])
    expect(listedOn(Chain.Ethereum)).toEqual([swap])
  })
})
