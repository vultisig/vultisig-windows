import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { BlockaidTxScanInputResolver } from '../resolver'

export const getSolanaBlockaidTxScanInput: BlockaidTxScanInputResolver = ({
  payload,
  walletCore,
}) => {
  const coin = assertField(payload, 'coin')

  const {
    recentBlockHash,
    fromTokenAssociatedAddress,
    toTokenAssociatedAddress,
  } = getBlockchainSpecificValue(payload.blockchainSpecific, 'solanaSpecific')

  const swapPayload = getKeysignSwapPayload(payload)

  if (swapPayload) {
    return null
  }

  const getSerializedMessage = (): string => {
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
    }

    if (!toTokenAssociatedAddress) {
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
    }

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

  return {
    data: {
      account_address: coin.address,
      encoding: 'base58',
      transactions: [getSerializedMessage()],
      method: 'signAndSendTransaction',
    },
  }
}
