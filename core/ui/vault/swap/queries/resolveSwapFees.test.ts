import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { NativeSwapQuote } from '@vultisig/core-chain/swap/native/NativeSwapQuote'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { describe, expect, it } from 'vitest'

import { SwapAffiliateBps } from '../affiliate/affiliateBps'
import { getSwapFeeEntries, resolveSwapFees } from './resolveSwapFees'

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

const noDiscount: SwapAffiliateBps = { product: 50, referral: 0 }

type NativeFees = NativeSwapQuote['fees']

const nativeQuote = (fees: NativeFees): SwapQuoteResult => ({
  native: {
    swapChain: Chain.THORChain,
    expected_amount_out: '1000000',
    expiry: 0,
    fees,
    memo: '',
    notes: '',
    outbound_delay_blocks: 0,
    outbound_delay_seconds: 0,
    recommended_min_amount_in: '0',
    warning: '',
  },
})

const resolveNative = ({
  fees,
  affiliateBps = noDiscount,
}: {
  fees: NativeFees
  affiliateBps?: SwapAffiliateBps
}) =>
  resolveSwapFees({
    quote: nativeQuote(fees),
    network: computedNetworkFee,
    toCoinKey,
    toCoin: undefined,
    fromCoin: undefined,
    affiliateBps,
  })

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
      toCoin: undefined,
      fromCoin: undefined,
      affiliateBps: noDiscount,
    })

    // Regression: the solana branch used to override this with the provider's 0n.
    expect(result.network.amount).toBe(5000n)
    expect(result.network.chain).toBe(Chain.Solana)
    expect(result.affiliate).toBe(providerSwapFee)
  })

  it('uses the provider network fee for a Solana swap when it exceeds the computed one', () => {
    const quote: SwapQuoteResult = {
      general: {
        dstAmount: '1000000',
        provider: 'swapkit',
        tx: {
          solana: {
            data: '',
            // Provider reports a higher fee than we computed.
            networkFee: 8000n,
            swapFee: providerSwapFee,
          },
        },
      },
    }

    const result = resolveSwapFees({
      quote,
      network: computedNetworkFee,
      toCoinKey,
      toCoin: undefined,
      fromCoin: undefined,
      affiliateBps: noDiscount,
    })

    expect(result.network.amount).toBe(8000n)
    expect(result.network.decimals).toBe(computedNetworkFee.decimals)
  })

  it('threads the computed network fee through the transfer branch and discloses no affiliate amount', () => {
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
      toCoin: undefined,
      fromCoin: undefined,
      affiliateBps: noDiscount,
    })

    expect(result.network).toBe(computedNetworkFee)
    // A deposit-channel route never echoes the affiliate amount; the row falls
    // back to disclosing the rate alone.
    expect(result.affiliate).toBeUndefined()
    expect(result.protocol).toBeUndefined()
  })

  it('grosses the discount basis back up by the cut already taken', () => {
    const result = resolveNative({
      fees: {
        affiliate: '300',
        asset: 'ETH.ETH',
        outbound: '400',
        total: '1000',
      },
    })

    // expected_amount_out is net of the affiliate cut, so the rate was charged
    // on 1_000_000 + 300 — measuring a discount against the net payout would
    // understate it.
    expect(result.affiliateNotional?.amount).toBe(1_000_300n)
  })

  it('still exposes a discount basis on a route that itemizes no fee', () => {
    const quote: SwapQuoteResult = {
      general: {
        dstAmount: '1000000',
        provider: 'swapkit',
        tx: { transfer: { to: 'deposit-address', amount: 1000n } },
      },
    }

    const result = resolveSwapFees({
      quote,
      network: computedNetworkFee,
      toCoinKey,
      toCoin: {
        chain: Chain.Ethereum,
        decimals: 18,
        ticker: 'ETH',
        logo: 'eth',
      },
      fromCoin: undefined,
      affiliateBps: noDiscount,
    })

    // The fee is baked into the quoted rate, so there is nothing to scale a
    // discount from — the payout is what keeps the discount row from blanking.
    expect(result.affiliate).toBeUndefined()
    expect(result.affiliateNotional?.amount).toBe(1_000_000n)
  })

  it('keeps the discount basis out of the total', () => {
    const result = resolveNative({
      fees: {
        affiliate: '300',
        asset: 'ETH.ETH',
        outbound: '400',
        total: '1000',
      },
    })

    const total = getSwapFeeEntries(result).reduce(
      (sum, { amount }) => sum + amount,
      0n
    )

    // The notional dwarfs every fee; leaking it into the total would be obvious
    // and catastrophic.
    expect(total).toBe(6000n)
  })

  it('itemizes a native quote into the product cut and the protocol remainder', () => {
    const result = resolveNative({
      fees: {
        affiliate: '300',
        asset: 'ETH.ETH',
        outbound: '400',
        total: '1000',
      },
    })

    // Only the affiliate belongs to the product — the outbound and liquidity
    // fees that made up the rest of `total` are the protocol's.
    expect(result.affiliate?.amount).toBe(300n)
    expect(result.protocol?.amount).toBe(700n)
    expect(result.referral).toBeUndefined()
  })

  it('leaves the headline total unchanged while splitting it', () => {
    const result = resolveNative({
      fees: {
        affiliate: '300',
        asset: 'ETH.ETH',
        outbound: '400',
        total: '1000',
      },
    })

    const total = getSwapFeeEntries(result).reduce(
      (sum, { amount }) => sum + amount,
      0n
    )

    // network 5000 + the quote's own total 1000: itemizing must not move it.
    expect(total).toBe(6000n)
  })

  it('splits the combined affiliate fee pro-rata when a referral takes a share', () => {
    // THORChain reports one affiliate figure for every affiliate in the memo,
    // so a 35/10 bps split has to be recovered from the bps that were sent.
    const result = resolveNative({
      fees: {
        affiliate: '450',
        asset: 'ETH.ETH',
        outbound: '550',
        total: '1000',
      },
      affiliateBps: { product: 35, referral: 10 },
    })

    expect(result.affiliate?.amount).toBe(350n)
    expect(result.referral?.amount).toBe(100n)
    expect(result.protocol?.amount).toBe(550n)
  })

  it('reports no product cut at a fully waived rate while still showing the protocol fee', () => {
    const result = resolveNative({
      fees: { affiliate: '0', asset: 'ETH.ETH', outbound: '700', total: '700' },
      affiliateBps: { product: 0, referral: 0 },
    })

    expect(result.affiliate?.amount).toBe(0n)
    expect(result.protocol?.amount).toBe(700n)
  })

  it('never lets a malformed quote inflate the total by charging more affiliate than total', () => {
    const result = resolveNative({
      fees: { affiliate: '900', asset: 'ETH.ETH', outbound: '0', total: '500' },
    })

    expect(result.affiliate?.amount).toBe(500n)
    expect(result.protocol).toBeUndefined()
  })

  it('books the CowSwap settlement fee as a protocol charge, not the product cut', () => {
    const quote: SwapQuoteResult = {
      general: {
        dstAmount: '1000000',
        provider: 'cowswap',
        tx: {
          cowswap_order: {
            sellToken: '0xsell',
            buyToken: '0xbuy',
            receiver: '0xreceiver',
            sellAmount: '1000',
            buyAmount: '900',
            validTo: 0,
            appData: '{}',
            appDataHash: '0xhash',
            feeAmount: '250',
            kind: 'sell',
            partiallyFillable: false,
            sellTokenBalance: 'erc20',
            buyTokenBalance: 'erc20',
            chainId: 1,
            apiBase: 'https://api.cow.fi',
          },
        },
      },
    }

    const result = resolveSwapFees({
      quote,
      network: computedNetworkFee,
      toCoinKey,
      toCoin: undefined,
      fromCoin: {
        chain: Chain.Ethereum,
        id: '0xsell',
        decimals: 18,
        ticker: 'SELL',
        logo: 'sell',
      },
      affiliateBps: noDiscount,
    })

    // The product's CowSwap cut rides in the order's appData and is taken from
    // surplus, so `feeAmount` is never ours to claim.
    expect(result.protocol?.amount).toBe(250n)
    expect(result.affiliate).toBeUndefined()
  })

  it('itemizes no charge for a RUJI Trade execute and keeps the computed gas', () => {
    const quote: SwapQuoteResult = {
      general: {
        dstAmount: '1000000',
        provider: 'ruji',
        tx: {
          cosmosWasm: {
            sender: 'thor1sender',
            contract: 'thor1market',
            executeMsg:
              '{"swap":{"min":{"min_return":"990000","to":"thor1dest"}}}',
            funds: [{ denom: 'rune', amount: '1000' }],
          },
        },
      },
    }

    const result = resolveSwapFees({
      quote,
      network: computedNetworkFee,
      toCoinKey,
      toCoin: undefined,
      fromCoin: {
        chain: Chain.THORChain,
        decimals: 8,
        ticker: 'RUNE',
        logo: 'rune',
      },
      affiliateBps: noDiscount,
    })

    // FIN's protocol fee is simulated on-contract and already netted out of
    // `dstAmount`, so there is nothing to itemize; gas stays the keysign
    // payload's computed figure.
    expect(result.affiliate).toBeUndefined()
    expect(result.protocol).toBeUndefined()
    expect(result.network).toEqual(computedNetworkFee)
  })
})
