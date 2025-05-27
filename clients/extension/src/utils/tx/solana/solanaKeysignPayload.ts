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

import { ParsedSolanaSwapParams } from './types/types'
export const getSolanaSwapKeysignPayload = (
  parsedSwapParams: ParsedSolanaSwapParams,
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
          ticker: parsedSwapParams.inputToken.symbol.toUpperCase(),
          address: parsedSwapParams.authority,
          decimals: parsedSwapParams.inputToken.decimals,
          hexPublicKey: toHexPublicKey({
            publicKey,
            walletCore,
          }),
          logo: parsedSwapParams.inputToken.name.toLowerCase(),
          priceProviderId:
            parsedSwapParams.inputToken.symbol === 'SOL'
              ? 'solana'
              : parsedSwapParams.inputToken.extensions?.coingeckoId,
          contractAddress:
            parsedSwapParams.inputToken.symbol === 'SOL'
              ? ''
              : parsedSwapParams.inputToken.address,
        })
        const accountCoin = {
          ...coin,
          id:
            parsedSwapParams.inputToken.symbol === 'SOL'
              ? coin.ticker
              : parsedSwapParams.inputToken.address,
        } as AccountCoin

        const chainSpecific = await getChainSpecific({
          coin: accountCoin,
          amount: Number(0),
          isDeposit: false,
          receiver: '',
        })
        chainSpecific.value = {
          ...(chainSpecific.value as SolanaSpecific),
          priorityFee:
            (chainSpecific.value as SolanaSpecific).priorityFee === '0'
              ? '1000000'
              : (chainSpecific.value as SolanaSpecific).priorityFee,
        }

        const swapPayload = create(OneInchSwapPayloadSchema, {
          fromCoin: {
            address: parsedSwapParams.authority,
            chain: Chain.Solana,
            contractAddress:
              parsedSwapParams.inputToken.symbol === 'SOL'
                ? ''
                : parsedSwapParams.inputToken.address,
            decimals: parsedSwapParams.inputToken.decimals,
            hexPublicKey: vault.publicKeys.ecdsa,
            priceProviderId:
              parsedSwapParams.inputToken.extensions?.coingeckoId ??
              parsedSwapParams.inputToken.name.toLowerCase(),
            logo:
              parsedSwapParams.inputToken.symbol === 'SOL'
                ? parsedSwapParams.inputToken.name.toLowerCase()
                : parsedSwapParams.inputToken.symbol.toLowerCase(),
            isNativeToken: parsedSwapParams.inputToken.symbol === 'SOL',
            ticker: parsedSwapParams.inputToken.symbol.toUpperCase(),
          },
          toCoin: {
            address: parsedSwapParams.authority,
            chain: Chain.Solana,
            contractAddress:
              parsedSwapParams.outputToken.symbol === 'SOL'
                ? ''
                : parsedSwapParams.outputToken.address,
            decimals: parsedSwapParams.outputToken.decimals,
            hexPublicKey: vault.publicKeys.ecdsa,
            priceProviderId:
              parsedSwapParams.outputToken.extensions?.coingeckoId ??
              parsedSwapParams.outputToken.name.toLowerCase(),
            logo:
              parsedSwapParams.outputToken.symbol === 'SOL'
                ? parsedSwapParams.outputToken.name.toLowerCase()
                : parsedSwapParams.outputToken.symbol.toLowerCase(),
            isNativeToken: parsedSwapParams.outputToken.symbol === 'SOL',
            ticker: parsedSwapParams.outputToken.symbol.toUpperCase(),
          },
          fromAmount: String(parsedSwapParams.inAmount),
          toAmountDecimal: formatUnits(
            parsedSwapParams.outAmount,
            parsedSwapParams.outputToken.decimals
          ),
          quote: {
            dstAmount: String(parsedSwapParams.outAmount),
            tx: {
              data: base64Data,
              value: '0',
              gasPrice: '0',
              swapFee: '25000',
            },
          },
        })
        const keysignPayload = create(KeysignPayloadSchema, {
          toAmount: '10000000',
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: chainSpecific,
          swapPayload: { case: 'oneinchSwapPayload', value: swapPayload },
        })

        resolve(keysignPayload)
      } catch (error) {
        reject(error)
      }
    })()
  })
}
