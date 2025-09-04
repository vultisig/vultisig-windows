import { create } from '@bufbuild/protobuf'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getSolanaTokenMetadata } from '@core/chain/coin/token/metadata/resolvers/solana'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { SolanaSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
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

const resolveTokenFromMint = async (mint: string): Promise<Coin> => {
  // Native SOL
  if (mint === NATIVE_MINT.toBase58()) {
    return chainFeeCoin.Solana
  }
  try {
    const key = {
      chain: Chain.Solana,
      id: mint,
    } as const
    const metadata = await getSolanaTokenMetadata(key)
    return {
      ...key,
      ...metadata,
    }
  } catch {
    return chainFeeCoin.Solana
  }
}

type GetSolanaKeysignPayloadInput = {
  parsed: ParsedResult
  serialized: Uint8Array
  vault: Vault
  walletCore: WalletCore
  skipBroadcast?: boolean
  requestOrigin: string
}

export const getSolanaKeysignPayload = ({
  parsed,
  serialized,
  vault,
  walletCore,
  skipBroadcast,
  requestOrigin,
}: GetSolanaKeysignPayloadInput): Promise<KeysignPayload> => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
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
        const inputToken = await resolveTokenFromMint(parsed.inputMint)

        const isNativeCoin = inputToken.ticker === 'SOL'

        const coin = create(CoinSchema, {
          chain: Chain.Solana,
          ticker: inputToken.ticker.toUpperCase(),
          address: parsed.authority, // sender/authority
          decimals: inputToken.decimals,
          hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          logo: inputToken.logo,
          priceProviderId: inputToken.priceProviderId,
          contractAddress: isNativeCoin ? '' : inputToken.id,
          isNativeToken: isNativeCoin,
        })

        const accountCoin = {
          ...coin,
          id: !isNativeCoin ? inputToken.id : undefined,
        } as AccountCoin

        const chainSpecific = await getChainSpecific({
          coin: accountCoin,
          amount: parsed.inAmount ? Number(parsed.inAmount) : 0,
          isDeposit: false,
          receiver:
            parsed.kind === 'transfer' ? (parsed.receiverAddress ?? '') : '',
        })

        chainSpecific.value = {
          ...(chainSpecific.value as SolanaSpecific),
          priorityFee:
            (chainSpecific.value as SolanaSpecific).priorityFee === '0'
              ? '1000000'
              : (chainSpecific.value as SolanaSpecific).priorityFee,
        }

        let swapPayload = null
        if (parsed.kind === 'swap') {
          const outputToken = await resolveTokenFromMint(parsed.outputMint)

          swapPayload = create(OneInchSwapPayloadSchema, {
            provider: getUrlBaseDomain(requestOrigin),
            fromCoin: {
              address: parsed.authority,
              chain: Chain.Solana,
              contractAddress: isNativeCoin ? '' : inputToken.id,
              decimals: inputToken.decimals,
              hexPublicKey: vault.publicKeys.ecdsa,
              priceProviderId: isNativeCoin
                ? chainFeeCoin.Solana.priceProviderId
                : inputToken.priceProviderId,
              logo: inputToken.logo,
              isNativeToken: isNativeCoin,
              ticker: inputToken.ticker,
            },
            toCoin: {
              address: parsed.authority,
              chain: Chain.Solana,
              contractAddress:
                outputToken.ticker === 'SOL' ? '' : outputToken.id,
              decimals: outputToken.decimals,
              hexPublicKey: vault.publicKeys.ecdsa,
              priceProviderId:
                outputToken.ticker === 'SOL'
                  ? chainFeeCoin.Solana.priceProviderId
                  : outputToken.priceProviderId,
              logo: outputToken.logo,
              isNativeToken: outputToken.ticker === 'SOL',
              ticker: outputToken.ticker,
            },
            fromAmount: String(parsed.inAmount),
            toAmountDecimal: formatUnits(
              String(parsed.outAmount ?? 0),
              outputToken.decimals
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
          coin,
          blockchainSpecific: chainSpecific,
          swapPayload: swapPayload
            ? { case: 'oneinchSwapPayload', value: swapPayload }
            : undefined,
          toAddress:
            parsed.kind === 'transfer' ? parsed.receiverAddress : undefined,
          skipBroadcast,
        })

        resolve(keysignPayload)
      } catch (error) {
        reject(error)
      }
    })()
  })
}
