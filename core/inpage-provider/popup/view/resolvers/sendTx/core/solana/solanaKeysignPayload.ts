import { create } from '@bufbuild/protobuf'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Vault } from '@core/ui/vault/Vault'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { WalletCore } from '@trustwallet/wallet-core'
import { formatUnits } from 'ethers'

import { SolanaTxData } from './types/types'

type GetSolanaKeysignPayloadInput = {
  parsed: SolanaTxData
  serialized: Uint8Array
  vault: Vault
  walletCore: WalletCore
  skipBroadcast?: boolean
  requestOrigin: string
  coin: AccountCoin
  chainSpecific: KeysignChainSpecific
}

export const getSolanaKeysignPayload = ({
  parsed,
  serialized,
  vault,
  walletCore,
  skipBroadcast,
  requestOrigin,
  coin,
  chainSpecific,
}: GetSolanaKeysignPayloadInput): KeysignPayload => {
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

  return matchRecordUnion(parsed, {
    swap: swap => {
      const swapPayload = create(OneInchSwapPayloadSchema, {
        provider: getUrlBaseDomain(requestOrigin),
        fromCoin: fromCoin,
        toCoin: toCommCoin({
          ...swap.outputCoin,
          address: swap.authority,
          hexPublicKey,
        }),
        fromAmount: String(swap.inAmount),
        toAmountDecimal: formatUnits(
          String(swap.outAmount ?? 0),
          swap.outputCoin.decimals
        ),
        quote: {
          dstAmount: String(swap.outAmount ?? 0),
          tx: {
            data: base64Data,
            value: '0',
            gasPrice: '0',
            swapFee: '25000',
          },
        },
      })

      return create(KeysignPayloadSchema, {
        toAmount: String(swap.inAmount),
        vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
        vaultLocalPartyId: 'VultiConnect',
        coin: fromCoin,
        blockchainSpecific: chainSpecific,
        swapPayload: { case: 'oneinchSwapPayload', value: swapPayload },
        skipBroadcast,
      })
    },
    transfer: transfer => {
      return create(KeysignPayloadSchema, {
        toAmount: String(transfer.inAmount),
        toAddress: transfer.receiverAddress,
        vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
        vaultLocalPartyId: 'VultiConnect',
        coin: fromCoin,
        blockchainSpecific: chainSpecific,
        skipBroadcast,
      })
    },
  })
}
