import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { PreSignedInputDataResolver } from './PreSignedInputDataResolver'

export const getSolanaPreSignedInputData: PreSignedInputDataResolver<
  'solanaSpecific'
> = ({ keysignPayload, chainSpecific, walletCore }) => {
  const coin = assertField(keysignPayload, 'coin')

  const {
    recentBlockHash,
    fromTokenAssociatedAddress,
    toTokenAssociatedAddress,
    programId,
  } = chainSpecific

  if (coin.isNativeToken) {
    const input = TW.Solana.Proto.SigningInput.create({
      transferTransaction: TW.Solana.Proto.Transfer.create({
        recipient: keysignPayload.toAddress,
        value: Long.fromString(keysignPayload.toAmount),
        memo: keysignPayload?.memo,
      }),
      recentBlockhash: recentBlockHash,
      sender: coin.address,
      priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
        price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
      }),
      priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
        limit: solanaConfig.priorityFeeLimit,
      }),
    })

    return TW.Solana.Proto.SigningInput.encode(input).finish()
  }

  if (!fromTokenAssociatedAddress) {
    throw new Error(
      'Keysign payload is invalid: fromTokenAssociatedAddress is missing'
    )
  }

  if (toTokenAssociatedAddress) {
    // Both addresses are available for token transfer
    const tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
      tokenMintAddress: coin.contractAddress,
      senderTokenAddress: fromTokenAssociatedAddress,
      recipientTokenAddress: toTokenAssociatedAddress,
      amount: Long.fromString(keysignPayload.toAmount),
      decimals: coin.decimals,
      tokenProgramId: programId
        ? TW.Solana.Proto.TokenProgramId.Token2022Program
        : TW.Solana.Proto.TokenProgramId.TokenProgram,
    })

    const input = TW.Solana.Proto.SigningInput.create({
      tokenTransferTransaction: tokenTransferMessage,
      recentBlockhash: recentBlockHash,
      sender: coin.address,
      priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
        price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
      }),
      priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
        limit: solanaConfig.priorityFeeLimit,
      }),
    })

    return TW.Solana.Proto.SigningInput.encode(input).finish()
  }

  const receiverAddress = walletCore.SolanaAddress.createWithString(
    keysignPayload.toAddress
  )
  const generatedAssociatedAddress = receiverAddress.defaultTokenAddress(
    coin.contractAddress
  )

  if (!generatedAssociatedAddress) {
    throw new Error(
      'We must have the association between the minted token and the TO address'
    )
  }

  const createAndTransferTokenMessage =
    TW.Solana.Proto.CreateAndTransferToken.create({
      recipientMainAddress: keysignPayload.toAddress,
      tokenMintAddress: coin.contractAddress,
      recipientTokenAddress: generatedAssociatedAddress,
      senderTokenAddress: fromTokenAssociatedAddress,
      amount: Long.fromString(keysignPayload.toAmount),
      decimals: coin.decimals,
      tokenProgramId: programId
        ? TW.Solana.Proto.TokenProgramId.Token2022Program
        : TW.Solana.Proto.TokenProgramId.TokenProgram,
    })

  const input = TW.Solana.Proto.SigningInput.create({
    createAndTransferTokenTransaction: createAndTransferTokenMessage,
    recentBlockhash: recentBlockHash,
    sender: coin.address,
    priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
      price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
    }),
    priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
      limit: solanaConfig.priorityFeeLimit,
    }),
  })

  return TW.Solana.Proto.SigningInput.encode(input).finish()
}
