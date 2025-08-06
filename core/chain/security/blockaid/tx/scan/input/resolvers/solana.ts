import { OtherChain } from '@core/chain/Chain'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { getCoinType } from '@core/chain/coin/coinType'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import Long from 'long'

import { BlockaidTxScanInputResolver } from '../resolver'

type SolanaBlockaidTxData = {
  account_address: string
  encoding: string
  transactions: string[]
  method: string
}

type GetSolanaBlockaidDataInput = {
  payload: KeysignPayload
  walletCore: WalletCore
}

export const getSolanaBlockaidData = ({
  payload,
  walletCore,
}: GetSolanaBlockaidDataInput): SolanaBlockaidTxData => {
  const coin = assertField(payload, 'coin')

  const {
    recentBlockHash,
    fromTokenAssociatedAddress,
    toTokenAssociatedAddress,
  } = getBlockchainSpecificValue(payload.blockchainSpecific, 'solanaSpecific')

  const swapPayload = getKeysignSwapPayload(payload)

  const getSerializedMessage = (): string => {
    if (swapPayload) {
      return matchRecordUnion(swapPayload, {
        native: () => {
          throw new Error('Native swap not supported')
        },
        general: swapPayload => {
          const tx = shouldBePresent(swapPayload.quote?.tx)
          const { data } = tx

          const decodedData = walletCore.TransactionDecoder.decode(
            getCoinType({
              walletCore,
              chain: OtherChain.Solana,
            }),
            Buffer.from(data, 'base64')
          )
          const { transaction } =
            TW.Solana.Proto.DecodingTransactionOutput.decode(decodedData)

          shouldBePresent(transaction, 'transaction')

          const signingInput = TW.Solana.Proto.SigningInput.create({
            recentBlockhash: recentBlockHash,
          })

          return Buffer.from(
            TW.Solana.Proto.SigningInput.encode(signingInput).finish()
          ).toString('base64')
        },
      })
    } else {
      const amount = BigInt(payload.toAmount)
      const senderAddress = coin.address
      const receiverAddress = payload.toAddress

      if (!coin.contractAddress) {
        const input = TW.Solana.Proto.SigningInput.create({
          transferTransaction: TW.Solana.Proto.Transfer.create({
            recipient: receiverAddress,
            value: Long.fromString(amount.toString()),
          }),
          recentBlockhash: recentBlockHash,
          sender: senderAddress,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
          }),
          priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
            limit: solanaConfig.priorityFeeLimit,
          }),
        })

        return Buffer.from(
          TW.Solana.Proto.SigningInput.encode(input).finish()
        ).toString('base64')
      } else if (coin.contractAddress && !toTokenAssociatedAddress) {
        const receiverSolanaAddress = walletCore.SolanaAddress.createWithString(
          payload.toAddress
        )

        if (!receiverSolanaAddress.description()) {
          throw new Error('Invalid receiver address')
        }

        const decimals = coin.decimals ?? 6

        const tokenTransferMessage =
          TW.Solana.Proto.CreateAndTransferToken.create({
            recipientMainAddress: payload.toAddress,
            tokenMintAddress: coin.contractAddress,
            recipientTokenAddress: '',
            senderTokenAddress: fromTokenAssociatedAddress,
            amount: Long.fromString(amount.toString()),
            decimals,
            tokenProgramId: coin.contractAddress.endsWith('22')
              ? TW.Solana.Proto.TokenProgramId.Token2022Program
              : TW.Solana.Proto.TokenProgramId.TokenProgram,
          })

        const input = TW.Solana.Proto.SigningInput.create({
          createAndTransferTokenTransaction: tokenTransferMessage,
          recentBlockhash: recentBlockHash,
          sender: senderAddress,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
          }),
          priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
            limit: solanaConfig.priorityFeeLimit,
          }),
        })

        return Buffer.from(
          TW.Solana.Proto.SigningInput.encode(input).finish()
        ).toString('base64')
      } else {
        // Token transfer
        const tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
          tokenMintAddress: coin.contractAddress,
          senderTokenAddress: fromTokenAssociatedAddress,
          recipientTokenAddress: toTokenAssociatedAddress,
          amount: Long.fromString(amount.toString()),
          decimals: coin.decimals ?? 6,
          tokenProgramId: coin.contractAddress?.endsWith('22')
            ? TW.Solana.Proto.TokenProgramId.Token2022Program
            : TW.Solana.Proto.TokenProgramId.TokenProgram,
        })

        const input = TW.Solana.Proto.SigningInput.create({
          tokenTransferTransaction: tokenTransferMessage,
          recentBlockhash: recentBlockHash,
          sender: senderAddress,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
          }),
          priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
            limit: solanaConfig.priorityFeeLimit,
          }),
        })

        return Buffer.from(
          TW.Solana.Proto.SigningInput.encode(input).finish()
        ).toString('base64')
      }
    }
  }

  return {
    account_address: coin.address,
    encoding: 'base58',
    transactions: [getSerializedMessage()],
    method: 'signAndSendTransaction',
  }
}

export const getSolanaBlockaidTxScanInput: BlockaidTxScanInputResolver<
  OtherChain.Solana
> = ({ payload, walletCore }) => {
  const data = getSolanaBlockaidData({ payload, walletCore })
  return {
    chain: OtherChain.Solana,
    data,
  }
}
