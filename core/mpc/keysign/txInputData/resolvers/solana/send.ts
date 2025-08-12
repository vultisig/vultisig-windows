import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'

type GetSolanaSendTxInputDataInput = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

export const getSolanaSendTxInputData = ({
  keysignPayload,
  walletCore,
}: GetSolanaSendTxInputDataInput): Uint8Array<ArrayBufferLike> => {
  const coin = getKeysignCoin(keysignPayload)

  const {
    recentBlockHash,
    fromTokenAssociatedAddress,
    toTokenAssociatedAddress,
    programId,
  } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'solanaSpecific'
  )

  const amount = BigInt(keysignPayload.toAmount)
  const sender = coin.address
  const recipient = keysignPayload.toAddress

  const getSigningInputCoinSpecificFields =
    (): Partial<TW.Solana.Proto.SigningInput> => {
      if (!coin.id) {
        return {
          transferTransaction: TW.Solana.Proto.Transfer.create({
            recipient,
            value: Long.fromString(amount.toString()),
            memo: keysignPayload.memo,
          }),
        }
      }

      const tokenProgramId = programId
        ? TW.Solana.Proto.TokenProgramId.Token2022Program
        : TW.Solana.Proto.TokenProgramId.TokenProgram

      const tokenTransferSharedFields = {
        tokenMintAddress: coin.id,
        senderTokenAddress: fromTokenAssociatedAddress,
        amount: Long.fromString(amount.toString()),
        decimals: coin.decimals,
        tokenProgramId,
      }

      if (!toTokenAssociatedAddress) {
        const receiverSolanaAddress =
          walletCore.SolanaAddress.createWithString(recipient)

        const recipientTokenAddress = programId
          ? receiverSolanaAddress.token2022Address(coin.id)
          : receiverSolanaAddress.defaultTokenAddress(coin.id)

        const tokenTransferMessage =
          TW.Solana.Proto.CreateAndTransferToken.create({
            ...tokenTransferSharedFields,
            recipientMainAddress: recipient,
            recipientTokenAddress,
          })

        return {
          createAndTransferTokenTransaction: tokenTransferMessage,
        }
      }

      return {
        tokenTransferTransaction: TW.Solana.Proto.TokenTransfer.create({
          ...tokenTransferSharedFields,
          recipientTokenAddress: toTokenAssociatedAddress,
        }),
      }
    }

  const signingInput = TW.Solana.Proto.SigningInput.create({
    recentBlockhash: recentBlockHash,
    sender,
    priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
      price: Long.fromString(solanaConfig.priorityFeePrice.toString()),
    }),
    priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
      limit: solanaConfig.priorityFeeLimit,
    }),
    ...getSigningInputCoinSpecificFields(),
  })

  return TW.Solana.Proto.SigningInput.encode(signingInput).finish()
}
