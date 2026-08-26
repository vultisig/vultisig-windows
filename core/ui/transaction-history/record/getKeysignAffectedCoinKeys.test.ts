import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { OneInchSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { KyberSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/kyberswap_swap_payload_pb'
import { THORChainSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { describe, expect, it } from 'vitest'

import { getKeysignAffectedCoinKeys } from './getKeysignAffectedCoinKeys'

const evmAddress = '0x1111111111111111111111111111111111111111'
const thorAddress = 'thor1wallet'
const usdcId = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const ethCoin = {
  chain: Chain.Ethereum,
  ticker: 'ETH',
  address: evmAddress,
  decimals: 18,
  isNativeToken: true,
}

const usdcCoin = {
  chain: Chain.Ethereum,
  ticker: 'USDC',
  contractAddress: usdcId,
  address: evmAddress,
  decimals: 6,
  isNativeToken: false,
}

const runeCoin = {
  chain: Chain.THORChain,
  ticker: 'RUNE',
  address: thorAddress,
  decimals: 8,
  isNativeToken: true,
}

// The keys are compared whole, not through `accountCoinKeyToString`: a key
// carrying coin metadata stringifies the same as a bare one yet matches no
// cached balance query, so only an exact comparison proves the keys usable.
const ethKey = { chain: Chain.Ethereum, address: evmAddress }
const usdcKey = { chain: Chain.Ethereum, id: usdcId, address: evmAddress }
const runeKey = { chain: Chain.THORChain, address: thorAddress }

describe('getKeysignAffectedCoinKeys', () => {
  it('pairs a token spend with the native fee coin', () => {
    const result = getKeysignAffectedCoinKeys(
      create(KeysignPayloadSchema, { coin: create(CoinSchema, usdcCoin) })
    )

    expect(result).toEqual([usdcKey, ethKey])
  })

  it('dedupes when the spent coin is already the fee coin', () => {
    const result = getKeysignAffectedCoinKeys(
      create(KeysignPayloadSchema, { coin: create(CoinSchema, ethCoin) })
    )

    expect(result).toEqual([ethKey])
  })

  it('includes the destination coin of a native swap', () => {
    const result = getKeysignAffectedCoinKeys(
      create(KeysignPayloadSchema, {
        coin: create(CoinSchema, runeCoin),
        swapPayload: {
          case: 'thorchainSwapPayload',
          value: create(THORChainSwapPayloadSchema, {
            fromCoin: create(CoinSchema, runeCoin),
            toCoin: create(CoinSchema, ethCoin),
          }),
        },
      })
    )

    expect(result).toEqual([runeKey, ethKey])
  })

  it('includes the destination coin of a general swap', () => {
    const result = getKeysignAffectedCoinKeys(
      create(KeysignPayloadSchema, {
        coin: create(CoinSchema, usdcCoin),
        swapPayload: {
          case: 'oneinchSwapPayload',
          value: create(OneInchSwapPayloadSchema, {
            fromCoin: create(CoinSchema, usdcCoin),
            toCoin: create(CoinSchema, ethCoin),
          }),
        },
      })
    )

    expect(result).toEqual([usdcKey, ethKey])
  })

  // The helper runs inside a keysign success handler, so a deprecated payload
  // must not surface as a signing failure on an already-broadcast transaction.
  it('still returns the spendable keys for a deprecated kyberswap payload', () => {
    const result = getKeysignAffectedCoinKeys(
      create(KeysignPayloadSchema, {
        coin: create(CoinSchema, usdcCoin),
        swapPayload: {
          case: 'kyberswapSwapPayload',
          value: create(KyberSwapPayloadSchema, {}),
        },
      })
    )

    expect(result).toEqual([usdcKey, ethKey])
  })
})
