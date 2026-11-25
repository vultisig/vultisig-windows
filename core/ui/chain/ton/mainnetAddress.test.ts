import { create } from '@bufbuild/protobuf'
import { Address } from '@ton/core'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  assertTonMainnetAddress,
  tonAddressToBounceable,
  tonAddressToRaw,
} from '@vultisig/core-chain/chains/ton/address'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { buildJettonTransfer } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/ton/jetton'
import {
  buildNativeTonTransfer,
  buildNativeTonTransferFromMessage,
} from '@vultisig/core-mpc/keysign/signingInputs/resolvers/ton/native'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { beforeAll, describe, expect, it } from 'vitest'

const account = Address.parse(
  '0:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)
const mainnet = account.toString({ bounceable: false })
const flagged = [true, false].flatMap(bounceable =>
  [true, false].map(urlSafe =>
    account.toString({ bounceable, urlSafe, testOnly: true })
  )
)

describe('TON mainnet destination boundary', () => {
  let walletCore: WalletCore
  beforeAll(async () => {
    walletCore = await initWasm()
  })

  it.each(flagged)(
    'rejects test-only destination %s before validation, normalization and serialization',
    address => {
      // WalletCore accepts these valid CRC-protected testnet addresses as TON.
      expect(
        walletCore.AnyAddress.isValid(address, walletCore.CoinType.ton)
      ).toBe(true)
      expect(isValidAddress({ address, chain: Chain.Ton, walletCore })).toBe(
        false
      )
      expect(() => assertTonMainnetAddress(address)).toThrow(/testnet-only/)
      expect(() => tonAddressToRaw(address)).toThrow(/testnet-only/)
      expect(() => tonAddressToBounceable(address)).toThrow(/testnet-only/)
      const keysignPayload = create(KeysignPayloadSchema, {
        toAddress: address,
        toAmount: '1',
      })
      expect(() =>
        buildNativeTonTransfer({
          keysignPayload,
          bounceable: false,
          walletVersion: 'v4r2',
        })
      ).toThrow(/testnet-only/)
      expect(() =>
        buildNativeTonTransferFromMessage({
          to: address,
          amount: '1',
          bounceable: false,
          walletVersion: 'v5r1',
        })
      ).toThrow(/testnet-only/)
      expect(() =>
        buildJettonTransfer({
          keysignPayload,
          walletCore,
          jettonAddress: mainnet,
          isActiveDestination: false,
          walletVersion: 'v4r2',
        })
      ).toThrow(/testnet-only/)
    }
  )

  it.each([
    account.toRawString(),
    ...[true, false].flatMap(bounceable =>
      [true, false].map(urlSafe => account.toString({ bounceable, urlSafe }))
    ),
  ])('accepts mainnet or unflagged raw destination %s', address => {
    expect(() => assertTonMainnetAddress(address)).not.toThrow()
    expect(isValidAddress({ address, chain: Chain.Ton, walletCore })).toBe(true)
    expect(() =>
      buildNativeTonTransferFromMessage({
        to: address,
        amount: '1',
        bounceable: false,
        walletVersion: 'v5r1',
      })
    ).not.toThrow()
  })

  it('rejects corrupted friendly and malformed raw addresses through recipient validation', () => {
    for (const address of [
      mainnet.slice(0, -1) + '!',
      '0:ff',
      'not-an-address',
    ]) {
      expect(isValidAddress({ address, chain: Chain.Ton, walletCore })).toBe(
        false
      )
    }
  })
})
