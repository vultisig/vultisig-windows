import { getChainKind } from '@core/chain/ChainKind'
import { getSigningInputLegacyTxFields } from '@core/chain/chains/evm/tx/getSigningInputLegacyTxFields'
import { getCoinType } from '@core/chain/coin/coinType'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { OneInchSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
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
  const { data } = tx

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
            data: Buffer.from(stripHexPrefix(data), 'hex'),
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

      const decodedData = walletCore.TransactionDecoder.decode(
        getCoinType({
          walletCore,
          chain: fromChain,
        }),
        Buffer.from(data, 'base64')
      )
      const decodedOutput =
        TW.Solana.Proto.DecodingTransactionOutput.decode(decodedData)

      const signingInput = TW.Solana.Proto.SigningInput.create({
        recentBlockhash: recentBlockHash,
        rawMessage: decodedOutput.transaction,
      })

      return TW.Solana.Proto.SigningInput.encode(signingInput).finish()
    },
  })
}
