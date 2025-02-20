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
  } = chainSpecific

  const newRecentBlockHash = recentBlockHash // DKLS should fix it. Using the same, since fetching the latest block hash won't match with IOS and Android

  if (coin.isNativeToken) {
    // Native token transfer
    const input = TW.Solana.Proto.SigningInput.create({
      transferTransaction: TW.Solana.Proto.Transfer.create({
        recipient: keysignPayload.toAddress,
        value: Long.fromString(keysignPayload.toAmount),
        memo: keysignPayload?.memo,
      }),
      recentBlockhash: newRecentBlockHash,
      sender: coin.address,
      priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
        price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
      }),
      priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
        limit: solanaConfig.priorityFeeLimit,
      }),
    })

    // Encode the input
    const encodedInput = TW.Solana.Proto.SigningInput.encode(input).finish()

    return encodedInput
  } else {
    // Token transfer
    if (fromTokenAssociatedAddress && toTokenAssociatedAddress) {
      // Both addresses are available for token transfer
      const tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
        tokenMintAddress: coin.contractAddress,
        senderTokenAddress: fromTokenAssociatedAddress,
        recipientTokenAddress: toTokenAssociatedAddress,
        amount: Long.fromString(keysignPayload.toAmount),
        decimals: coin.decimals,
      })

      const input = TW.Solana.Proto.SigningInput.create({
        tokenTransferTransaction: tokenTransferMessage,
        recentBlockhash: newRecentBlockHash,
        sender: coin.address,
        priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
          price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
        }),
        priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
          limit: solanaConfig.priorityFeeLimit,
        }),
      })

      return TW.Solana.Proto.SigningInput.encode(input).finish()
    } else if (fromTokenAssociatedAddress && !toTokenAssociatedAddress) {
      // Generate the associated address if `toTokenAssociatedAddress` is missing
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
        })

      const input = TW.Solana.Proto.SigningInput.create({
        createAndTransferTokenTransaction: createAndTransferTokenMessage,
        recentBlockhash: newRecentBlockHash,
        sender: coin.address,
        priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
          price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
        }),
        priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
          limit: solanaConfig.priorityFeeLimit,
        }),
      })

      return TW.Solana.Proto.SigningInput.encode(input).finish()
    } else {
      throw new Error(
        'To send tokens we must have the association between the minted token and the TO address'
      )
    }
  }
}
