import { create } from '@bufbuild/protobuf'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { SolanaSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'
import { formatUnits } from 'ethers'

import { ParsedSolanaTransactionParams } from './types/types'
export const getSolanaKeysignPayload = (
  parsedTransactionParams: ParsedSolanaTransactionParams,
  serialized: Uint8Array,
  vault: Vault,
  walletCore: WalletCore
): Promise<KeysignPayload> => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const txInputDataArray = Object.values(serialized)
        const publicKey = getPublicKey({
          chain: Chain.Solana,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
        const dataBuffer = Buffer.from(txInputDataBuffer)
        const base64Data = base64.encode(dataBuffer)
        const coin = create(CoinSchema, {
          chain: Chain.Solana,
          ticker: parsedTransactionParams.inputToken.symbol.toUpperCase(),
          address: parsedTransactionParams.authority,
          decimals: parsedTransactionParams.inputToken.decimals,
          hexPublicKey: toHexPublicKey({
            publicKey,
            walletCore,
          }),
          logo: parsedTransactionParams.inputToken.name.toLowerCase(),
          priceProviderId:
            parsedTransactionParams.inputToken.symbol === 'SOL'
              ? 'solana'
              : parsedTransactionParams.inputToken.extensions?.coingeckoId,
          contractAddress:
            parsedTransactionParams.inputToken.symbol === 'SOL'
              ? ''
              : parsedTransactionParams.inputToken.address,
        })
        const accountCoin = {
          ...coin,
          id:
            parsedTransactionParams.inputToken.symbol === 'SOL'
              ? coin.ticker
              : parsedTransactionParams.inputToken.address,
        } as AccountCoin

        const chainSpecific = await getChainSpecific({
          coin: accountCoin,
          amount: parsedTransactionParams.inAmount ?? Number(0),
          isDeposit: false,
          receiver: parsedTransactionParams.receiverAddress ?? '',
        })
        chainSpecific.value = {
          ...(chainSpecific.value as SolanaSpecific),
          priorityFee:
            (chainSpecific.value as SolanaSpecific).priorityFee === '0'
              ? '1000000'
              : (chainSpecific.value as SolanaSpecific).priorityFee,
        }
        let swapPayload = null
        if (
          parsedTransactionParams.outputToken &&
          parsedTransactionParams.outAmount
        ) {
          swapPayload = create(OneInchSwapPayloadSchema, {
            fromCoin: {
              address: parsedTransactionParams.authority,
              chain: Chain.Solana,
              contractAddress:
                parsedTransactionParams.inputToken.symbol === 'SOL'
                  ? ''
                  : parsedTransactionParams.inputToken.address,
              decimals: parsedTransactionParams.inputToken.decimals,
              hexPublicKey: vault.publicKeys.ecdsa,
              priceProviderId:
                parsedTransactionParams.inputToken.extensions?.coingeckoId ??
                parsedTransactionParams.inputToken.name.toLowerCase(),
              logo:
                parsedTransactionParams.inputToken.symbol === 'SOL'
                  ? parsedTransactionParams.inputToken.name.toLowerCase()
                  : parsedTransactionParams.inputToken.symbol.toLowerCase(),
              isNativeToken:
                parsedTransactionParams.inputToken.symbol === 'SOL',
              ticker: parsedTransactionParams.inputToken.symbol.toUpperCase(),
            },
            toCoin: {
              address: parsedTransactionParams.authority,
              chain: Chain.Solana,
              contractAddress:
                parsedTransactionParams.outputToken.symbol === 'SOL'
                  ? ''
                  : parsedTransactionParams.outputToken.address,
              decimals: parsedTransactionParams.outputToken.decimals,
              hexPublicKey: vault.publicKeys.ecdsa,
              priceProviderId:
                parsedTransactionParams.outputToken.extensions?.coingeckoId ??
                parsedTransactionParams.outputToken.name.toLowerCase(),
              logo:
                parsedTransactionParams.outputToken.symbol === 'SOL'
                  ? parsedTransactionParams.outputToken.name.toLowerCase()
                  : parsedTransactionParams.outputToken.symbol.toLowerCase(),
              isNativeToken:
                parsedTransactionParams.outputToken.symbol === 'SOL',
              ticker: parsedTransactionParams.outputToken.symbol.toUpperCase(),
            },
            fromAmount: String(parsedTransactionParams.inAmount),
            toAmountDecimal: formatUnits(
              parsedTransactionParams.outAmount,
              parsedTransactionParams.outputToken.decimals
            ),
            quote: {
              dstAmount: String(parsedTransactionParams.outAmount),
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
          toAmount: swapPayload
            ? swapPayload.toAmountDecimal
            : String(parsedTransactionParams?.inAmount ?? 0),
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: chainSpecific,
          swapPayload: swapPayload
            ? { case: 'oneinchSwapPayload', value: swapPayload }
            : undefined,
          toAddress: parsedTransactionParams.receiverAddress,
        })

        resolve(keysignPayload)
      } catch (error) {
        reject(error)
      }
    })()
  })
}
