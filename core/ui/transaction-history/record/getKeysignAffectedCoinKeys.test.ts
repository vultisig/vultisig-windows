import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { OneInchSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { KyberSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/kyberswap_swap_payload_pb'
import { THORChainSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { describe, expect, it } from 'vitest'

import { getKeysignAffectedCoinKeys } from './getKeysignAffectedCoinKeys'

const evmAddress = '0x1111111111111111111111111111111111111111'
const thorAddress = 'thor1wallet'

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
  contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
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

const keys = (payload: Parameters<typeof getKeysignAffectedCoinKeys>[0]) =>
  getKeysignAffectedCoinKeys(payload).map(accountCoinKeyToString)

describe('getKeysignAffectedCoinKeys', () => {
  it('includes the native fee coin when a token is spent', () => {
    const result = keys(
      create(KeysignPayloadSchema, { coin: create(CoinSchema, usdcCoin) })
    )

    expect(result).toContain(
      accountCoinKeyToString({
        ...chainFeeCoin[Chain.Ethereum],
        address: evmAddress,
      })
    )
    expect(result).toHaveLength(2)
  })

  it('dedupes when the spent coin is already the fee coin', () => {
    const result = keys(
      create(KeysignPayloadSchema, { coin: create(CoinSchema, ethCoin) })
    )

    expect(result).toHaveLength(1)
  })

  it('includes the destination coin of a native swap', () => {
    const result = keys(
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

    expect(result).toContain(accountCoinKeyToString(ethCoin))
    expect(result).toContain(accountCoinKeyToString(runeCoin))
  })

  it('includes the destination coin of a general swap', () => {
    const result = keys(
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

    expect(result).toContain(accountCoinKeyToString(ethCoin))
    expect(result).toContain(accountCoinKeyToString(usdcCoin))
  })

  // The helper runs inside a keysign success handler, so a deprecated payload
  // must not surface as a signing failure on an already-broadcast transaction.
  it('still returns the spendable keys for a deprecated kyberswap payload', () => {
    const result = keys(
      create(KeysignPayloadSchema, {
        coin: create(CoinSchema, usdcCoin),
        swapPayload: {
          case: 'kyberswapSwapPayload',
          value: create(KyberSwapPayloadSchema, {}),
        },
      })
    )

    expect(result).toContain(accountCoinKeyToString(usdcCoin))
    expect(result).toContain(
      accountCoinKeyToString({
        ...chainFeeCoin[Chain.Ethereum],
        address: evmAddress,
      })
    )
  })
})
