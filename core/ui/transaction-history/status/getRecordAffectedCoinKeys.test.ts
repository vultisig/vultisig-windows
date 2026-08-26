import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  LimitSwapTransactionRecord,
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
  TrustLineTransactionRecord,
} from '../core'
import { getRecordAffectedCoinKeys } from './getRecordAffectedCoinKeys'

const evmAddress = '0x1111111111111111111111111111111111111111'
const thorAddress = 'thor1wallet'
const rippleAddress = 'rWallet'
const usdcId = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const vaultAddresses: Partial<Record<Chain, string>> = {
  [Chain.Ethereum]: evmAddress,
  [Chain.THORChain]: thorAddress,
}

const base = {
  id: 'record-1',
  vaultId: 'vault-1',
  status: 'confirmed',
  timestamp: new Date().toISOString(),
  txHash: '0xhash',
  explorerUrl: 'https://example.com',
  fiatValue: '0',
} satisfies Omit<TransactionRecord, 'type' | 'chain' | 'data'>

const usdcSend: SendTransactionRecord = {
  ...base,
  type: 'send',
  chain: Chain.Ethereum,
  data: {
    fromAddress: evmAddress,
    toAddress: '0x2222222222222222222222222222222222222222',
    amount: '1',
    token: 'USDC',
    tokenLogo: 'usdc',
    tokenId: usdcId,
    decimals: 6,
  },
}

const usdcToRuneSwap: SwapTransactionRecord = {
  ...base,
  type: 'swap',
  chain: Chain.Ethereum,
  data: {
    fromToken: 'USDC',
    fromAmount: '1',
    fromChain: Chain.Ethereum,
    fromTokenLogo: 'usdc',
    fromTokenId: usdcId,
    fromDecimals: 6,
    toToken: 'RUNE',
    toAmount: '1',
    toChain: Chain.THORChain,
    toTokenLogo: 'rune',
    toDecimals: 8,
  },
}

const restingLimitOrder: LimitSwapTransactionRecord = {
  ...base,
  type: 'limitSwap',
  chain: Chain.THORChain,
  data: {
    fromAddress: thorAddress,
    fromToken: 'RUNE',
    fromTokenLogo: 'rune',
    fromChain: Chain.THORChain,
    fromDecimals: 8,
    fromAmount: '1',
    buyTicker: 'ETH',
    targetAsset: 'ETH.ETH',
    minimumReceived: '0.1',
    destinationAddress: evmAddress,
    orderStatus: 'resting',
    memo: '=:ETH.ETH:0x0',
  },
}

const openedTrustLine: TrustLineTransactionRecord = {
  ...base,
  type: 'trustLine',
  chain: Chain.Ripple,
  data: {
    fromAddress: rippleAddress,
    issuer: 'rIssuer',
    token: 'USD',
    tokenLogo: 'usd',
    tokenId: 'USD.rIssuer',
    limit: '1000',
    decimals: 15,
  },
}

const keysFor = (
  record: TransactionRecord,
  addresses: Partial<Record<Chain, string>> = vaultAddresses
) => getRecordAffectedCoinKeys({ record, vaultAddresses: addresses })

// Compared whole rather than through `accountCoinKeyToString`: a key carrying
// coin metadata stringifies the same as a bare one yet matches no cached
// balance query, so only an exact comparison proves the keys usable.
const ethKey = { chain: Chain.Ethereum, address: evmAddress }
const usdcKey = { chain: Chain.Ethereum, id: usdcId, address: evmAddress }
const runeKey = { chain: Chain.THORChain, address: thorAddress }
const xrpKey = { chain: Chain.Ripple, address: rippleAddress }

describe('getRecordAffectedCoinKeys', () => {
  it('pairs a token send with its chain fee coin', () => {
    expect(keysFor(usdcSend)).toEqual([usdcKey, ethKey])
  })

  it('covers both legs and the source fee coin of a swap', () => {
    expect(keysFor(usdcToRuneSwap)).toEqual([usdcKey, ethKey, runeKey])
  })

  it('drops a swap leg the vault has no address for', () => {
    expect(keysFor(usdcToRuneSwap, { [Chain.Ethereum]: evmAddress })).toEqual([
      usdcKey,
      ethKey,
    ])
  })

  it('leaves limit orders to their own tracker', () => {
    expect(keysFor(restingLimitOrder)).toEqual([])
  })

  it('refreshes the fee coin a trust line burned', () => {
    expect(keysFor(openedTrustLine)).toEqual([xrpKey])
  })
})
