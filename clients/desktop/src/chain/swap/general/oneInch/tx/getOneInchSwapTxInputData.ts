import { getChainKind } from '@core/chain/ChainKind'
import { getSigningInputLegacyTxFields } from '@core/chain/chains/evm/tx/getSigningInputLegacyTxFields'
import { OneInchSwapPayload } from '@core/communication/vultisig/keysign/v1/1inch_swap_payload_pb'
import { EthereumSpecific } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { getBlockchainSpecificValue } from '@core/keysign/chainSpecific/KeysignChainSpecific'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { match } from '@lib/utils/match'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { LifiSwapEnabledChain } from '../../lifi/LifiSwapEnabledChains'
import { OneInchSwapEnabledChain } from '../OneInchSwapEnabledChains'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

export const getOneInchSwapTxInputData = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<Uint8Array> => {
  const swapPayload = shouldBePresent(keysignPayload.swapPayload)
    .value as OneInchSwapPayload

  const fromCoin = shouldBePresent(swapPayload.fromCoin)
  const fromChain = fromCoin.chain as
    | OneInchSwapEnabledChain
    | LifiSwapEnabledChain

  const chainKind = getChainKind(fromChain)
  const { blockchainSpecific } = keysignPayload
  const tx = shouldBePresent(swapPayload.quote?.tx)

  return match(chainKind, {
    evm: () => {
      const amountHex = Buffer.from(
        stripHexPrefix(bigIntToHex(BigInt(tx.value || 0))),
        'hex'
      )

      const { nonce } = getBlockchainSpecificValue(
        blockchainSpecific,
        'ethereumSpecific'
      )

      const signingInput = TW.Ethereum.Proto.SigningInput.create({
        toAddress: tx.to,
        transaction: {
          contractGeneric: {
            amount: amountHex,
            data: Buffer.from(stripHexPrefix(tx.data), 'hex'),
          },
        },
        ...getSigningInputLegacyTxFields({
          chain: fromChain,
          walletCore,
          nonce,
          gasPrice: BigInt(tx.gasPrice || 0),
          gasLimit: BigInt(tx.gas),
        }),
      })

      return TW.Ethereum.Proto.SigningInput.encode(signingInput).finish()
    },
    solana: () => {
      const { recentBlockHash } = getBlockchainSpecificValue(
        blockchainSpecific,
        'solanaSpecific'
      )

      const signingInput = TW.Solana.Proto.SigningInput.create({
        recentBlockhash: recentBlockHash,
        rawMessage: null,
      })

      return TW.Solana.Proto.SigningInput.encode(signingInput).finish()
    },
  })
}
