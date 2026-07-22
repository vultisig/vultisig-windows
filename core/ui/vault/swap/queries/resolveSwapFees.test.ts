import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { describe, expect, it } from 'vitest'

import { resolveSwapFees } from './resolveSwapFees'

// The network fee computed up front from the keysign payload — the real cost.
const computedNetworkFee: SwapFee = {
  chain: Chain.Solana,
  amount: 5000n,
  decimals: 9,
}

const providerSwapFee: SwapFee = {
  chain: Chain.Solana,
  amount: 12_345n,
  decimals: 9,
}

const toCoinKey: CoinKey = { chain: Chain.Ethereum }

describe('resolveSwapFees', () => {
  it('keeps the computed network fee for a Solana general swap even when the provider reports networkFee 0 (#4381)', () => {
    const quote: SwapQuoteResult = {
      general: {
        dstAmount: '1000000',
        provider: 'swapkit',
        tx: {
          solana: {
            data: '',
            // Provider omits the network-fee entry -> SDK returns 0n here.
            networkFee: 0n,
            swapFee: providerSwapFee,
          },
        },
      },
    }

    const result = resolveSwapFees({
      quote,
      network: computedNetworkFee,
      toCoinKey,
      fromCoin: undefined,
    })

    // Regression: the solana branch used to override this with the provider's 0n.
    expect(result.network).toBe(computedNetworkFee)
    expect(result.network.amount).toBe(5000n)
    expect(result.swap).toBe(providerSwapFee)
  })

  it('threads the computed network fee through the transfer branch', () => {
    const quote: SwapQuoteResult = {
      general: {
        dstAmount: '1000000',
        provider: 'swapkit',
        tx: {
          transfer: {
            to: 'recipient-address',
            amount: 1000n,
          },
        },
      },
    }

    const result = resolveSwapFees({
      quote,
      network: computedNetworkFee,
      toCoinKey,
      fromCoin: undefined,
    })

    expect(result.network).toBe(computedNetworkFee)
    expect(result.swap).toBeUndefined()
  })
})
