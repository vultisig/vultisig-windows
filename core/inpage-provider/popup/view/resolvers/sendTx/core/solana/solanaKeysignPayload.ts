import { create } from '@bufbuild/protobuf'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getSolanaTokenMetadata } from '@core/chain/coin/token/metadata/resolvers/solana'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Vault } from '@core/ui/vault/Vault'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { NATIVE_MINT } from '@solana/spl-token'
import { WalletCore } from '@trustwallet/wallet-core'
import { formatUnits } from 'ethers'

import { ParsedResult } from './types/types'

type GetSolanaKeysignPayloadInput = {
  parsed: ParsedResult
  serialized: Uint8Array
  vault: Vault
  walletCore: WalletCore
  skipBroadcast?: boolean
  requestOrigin: string
  coin: AccountCoin
  chainSpecific: KeysignChainSpecific
}

export const getSolanaKeysignPayload = async ({
  parsed,
  serialized,
  vault,
  walletCore,
  skipBroadcast,
  requestOrigin,
  coin,
  chainSpecific,
}: GetSolanaKeysignPayloadInput): Promise<KeysignPayload> => {
  const txInputDataArray = Object.values(serialized)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
  const dataBuffer = Buffer.from(txInputDataBuffer)
  const base64Data = base64.encode(dataBuffer)

  const publicKey = getPublicKey({
    chain: Chain.Solana,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  const hexPublicKey = Buffer.from(publicKey.data()).toString('hex')

  const fromCoin = toCommCoin({
    ...coin,
    hexPublicKey,
  })

  let swapPayload = null
  if (parsed.kind === 'swap') {
    const getToCoin = async () => {
      if (parsed.outputMint === NATIVE_MINT.toBase58()) {
        return chainFeeCoin[Chain.Solana]
      }

      const coinKey = {
        chain: Chain.Solana,
        id: parsed.outputMint,
      } as const

      const metadata = await getSolanaTokenMetadata(coinKey)

      return {
        ...coinKey,
        ...metadata,
      }
    }

    const toCoin = await getToCoin()

    swapPayload = create(OneInchSwapPayloadSchema, {
      provider: getUrlBaseDomain(requestOrigin),
      fromCoin: fromCoin,
      toCoin: toCommCoin({
        ...toCoin,
        address: parsed.authority,
        hexPublicKey,
      }),
      fromAmount: String(parsed.inAmount),
      toAmountDecimal: formatUnits(
        String(parsed.outAmount ?? 0),
        toCoin.decimals
      ),
      quote: {
        dstAmount: String(parsed.outAmount ?? 0),
        tx: {
          data: base64Data,
          value: '0',
          gasPrice: '0',
          swapFee: '25000',
        },
      },
    })
  }

  const keysignPayload = create(KeysignPayloadSchema, {
    toAmount: String(parsed.inAmount),
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    vaultLocalPartyId: 'VultiConnect',
    coin: fromCoin,
    blockchainSpecific: chainSpecific,
    swapPayload: swapPayload
      ? { case: 'oneinchSwapPayload', value: swapPayload }
      : undefined,
    toAddress: parsed.kind === 'transfer' ? parsed.receiverAddress : undefined,
    skipBroadcast,
  })

  return keysignPayload
}
