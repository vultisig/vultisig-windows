import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
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
    fromAddress: 'rWallet',
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
) =>
  getRecordAffectedCoinKeys({ record, vaultAddresses: addresses }).map(
    accountCoinKeyToString
  )

const ethFeeKey = accountCoinKeyToString({
  ...chainFeeCoin[Chain.Ethereum],
  address: evmAddress,
})

describe('getRecordAffectedCoinKeys', () => {
  it('pairs a token send with its chain fee coin', () => {
    const result = keysFor(usdcSend)

    expect(result).toContain(
      accountCoinKeyToString({
        chain: Chain.Ethereum,
        id: usdcId,
        address: evmAddress,
      })
    )
    expect(result).toContain(ethFeeKey)
    expect(result).toHaveLength(2)
  })

  it('covers both legs and the source fee coin of a swap', () => {
    const result = keysFor(usdcToRuneSwap)

    expect(result).toContain(
      accountCoinKeyToString({
        chain: Chain.Ethereum,
        id: usdcId,
        address: evmAddress,
      })
    )
    expect(result).toContain(
      accountCoinKeyToString({ chain: Chain.THORChain, address: thorAddress })
    )
    expect(result).toContain(ethFeeKey)
  })

  it('drops a swap leg the vault has no address for', () => {
    const result = keysFor(usdcToRuneSwap, {
      [Chain.Ethereum]: evmAddress,
    })

    expect(result).not.toContain(
      accountCoinKeyToString({ chain: Chain.THORChain, address: thorAddress })
    )
    expect(result).toContain(ethFeeKey)
  })

  it('leaves limit orders to their own tracker', () => {
    expect(keysFor(restingLimitOrder)).toEqual([])
  })

  it('ignores trust line records', () => {
    expect(keysFor(openedTrustLine)).toEqual([])
  })
})
