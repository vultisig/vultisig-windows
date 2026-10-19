import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
import { OneInchSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { THORChainSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import { getSwapTxExplorerUrl } from './getSwapTxExplorerUrl'

const dogeTxHash =
  'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'

const thorchainSwapPayload = () =>
  shouldBePresent(
    getKeysignSwapPayload(
      create(KeysignPayloadSchema, {
        swapPayload: {
          case: 'thorchainSwapPayload',
          value: create(THORChainSwapPayloadSchema, {
            fromAddress: 'DFromAddress',
            fromAmount: '1000000000',
            toAmountDecimal: '0.0001',
          }),
        },
      })
    )
  )

const generalSwapPayload = (provider: string) =>
  shouldBePresent(
    getKeysignSwapPayload(
      create(KeysignPayloadSchema, {
        swapPayload: {
          case: 'oneinchSwapPayload',
          value: create(OneInchSwapPayloadSchema, {
            fromAmount: '1000000',
            toAmountDecimal: '1',
            provider,
          }),
        },
      })
    )
  )

describe('getSwapTxExplorerUrl', () => {
  it('opens a THORChain swap on the source chain, not the swap tracker', () => {
    // The hash is the DOGE deposit, so runescan — where Track goes — is the
    // wrong place for it (#5047).
    const swapPayload = thorchainSwapPayload()
    const input = {
      swapPayload,
      txHash: dogeTxHash,
      sourceChain: Chain.Dogecoin,
    }

    const url = getSwapTxExplorerUrl(input)

    expect(url).toBe(
      getBlockExplorerUrl({
        chain: Chain.Dogecoin,
        entity: 'tx',
        value: dogeTxHash,
      })
    )
    expect(url).not.toBe(getSwapTrackingUrl(input))
  })

  it('opens a general swap on the source chain', () => {
    const txHash = `0x${'ab'.repeat(32)}`

    expect(
      getSwapTxExplorerUrl({
        swapPayload: generalSwapPayload('li.fi'),
        txHash,
        sourceChain: Chain.Ethereum,
      })
    ).toBe(
      getBlockExplorerUrl({
        chain: Chain.Ethereum,
        entity: 'tx',
        value: txHash,
      })
    )
  })

  it('opens a CowSwap order on its order page, since the hash is the order UID', () => {
    const input = {
      swapPayload: generalSwapPayload('cowswap'),
      txHash: `0x${'cd'.repeat(56)}`,
      sourceChain: Chain.Ethereum,
    }

    expect(getSwapTxExplorerUrl(input)).toBe(getSwapTrackingUrl(input))
  })
})
