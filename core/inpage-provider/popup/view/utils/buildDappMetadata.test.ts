import { equals, fromBinary, toBinary } from '@bufbuild/protobuf'
import { BridgeContext } from '@lib/extension/bridge/context'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { DAppMetadataSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/dapp_metadata_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { buildSendTxKeysignPayload } from '../resolvers/sendTx/keysignPayload/build'
import { buildDappCustomMessagePayload } from '../resolvers/signMessage/overview/buildDappCustomMessagePayload'
import { buildDappMetadata } from './buildDappMetadata'

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', async () => {
  const { create } = await import('@bufbuild/protobuf')
  const { SolanaSpecificSchema } =
    await import('@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb')

  return {
    getChainSpecific: vi.fn(async () => ({
      case: 'solanaSpecific',
      value: create(SolanaSpecificSchema, {
        recentBlockHash: 'recent-block-hash',
        priorityFee: '0',
      }),
    })),
  }
})

const solanaCoin: AccountCoin = {
  chain: Chain.Solana,
  id: 'SOL',
  address: 'solana-wallet-address',
  decimals: 9,
  ticker: 'SOL',
}

let walletCore: WalletCore
let publicKey: PublicKey

beforeAll(async () => {
  walletCore = await initWasm()
  const privateKey = walletCore.PrivateKey.createWithData(
    new Uint8Array(32).fill(1)
  )
  publicKey = privateKey.getPublicKeySecp256k1(true)
  privateKey.delete()
})

afterAll(() => publicKey?.delete())

const contexts: Record<string, BridgeContext> = {
  'top frame': {
    requestOrigin: 'https://app.example.org',
    requestName: 'Example dApp',
    requestFavicon: 'https://app.example.org/favicon.ico',
  },
  iframe: {
    requestOrigin: 'https://embedded.example.org',
  },
}

describe('buildDappMetadata', () => {
  // A co-signer must see the same dApp whether the request travels as a
  // transaction or as a custom message, so both are compared as decoded from
  // the wire rather than as built.
  it.each(Object.entries(contexts))(
    'gives a transaction and a custom message the same identity (%s)',
    async (_, context) => {
      const keysignPayload = await buildSendTxKeysignPayload({
        parsedTx: {
          coin: solanaCoin,
          customTxData: {
            solana: {
              raw: {
                inputCoin: solanaCoin,
                inAmount: '0',
                transactions: ['raw-transaction'],
              },
            },
          },
        },
        publicKey,
        walletCore,
        vaultId: 'vault-id',
        localPartyId: 'local-party',
        dappMetadata: buildDappMetadata(context),
      })

      const customMessagePayload = buildDappCustomMessagePayload({
        method: 'sign_message',
        message: 'hello',
        chain: Chain.Solana,
        vaultPublicKeyEcdsa: 'vault-id',
        context,
      })

      const fromTransaction = shouldBePresent(
        fromBinary(
          KeysignPayloadSchema,
          toBinary(KeysignPayloadSchema, keysignPayload)
        ).dappMetadata
      )
      const fromCustomMessage = shouldBePresent(
        fromBinary(
          CustomMessagePayloadSchema,
          toBinary(CustomMessagePayloadSchema, customMessagePayload)
        ).dappMetadata
      )

      expect(
        equals(DAppMetadataSchema, fromTransaction, fromCustomMessage)
      ).toBe(true)
      expect(fromCustomMessage.url).toBe(context.requestOrigin)
    }
  )
})
