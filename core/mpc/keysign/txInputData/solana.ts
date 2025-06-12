import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { getCoinType } from '@core/chain/coin/coinType'
import { LifiSwapEnabledChain } from '@core/chain/swap/general/lifi/LifiSwapEnabledChains'
import { OneInchSwapEnabledChain } from '@core/chain/swap/general/oneInch/OneInchSwapEnabledChains'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { OneInchSwapPayload } from '../../types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { TxInputDataResolver } from './TxInputDataResolver'

export const getSolanaTxInputData: TxInputDataResolver<
  'solanaSpecific'
> = async ({ keysignPayload, chainSpecific, walletCore }) => {
  const coin = assertField(keysignPayload, 'coin')

  const {
    recentBlockHash,
    fromTokenAssociatedAddress,
    toTokenAssociatedAddress,
    programId,
  } = chainSpecific

  if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
    return matchDiscriminatedUnion(
      keysignPayload.swapPayload,
      'case',
      'value',
      {
        thorchainSwapPayload: () => {
          throw new Error('ThorChain swap not supported')
        },
        mayachainSwapPayload: () => {
          throw new Error('Mayachain swap not supported')
        },
        oneinchSwapPayload: () => {
          const swapPayload = shouldBePresent(keysignPayload.swapPayload)
            .value as OneInchSwapPayload

          const fromCoin = shouldBePresent(swapPayload.fromCoin)
          const fromChain = fromCoin.chain as
            | OneInchSwapEnabledChain
            | LifiSwapEnabledChain

          const { blockchainSpecific } = keysignPayload
          const tx = shouldBePresent(swapPayload.quote?.tx)
          const { data } = tx

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

          return [TW.Solana.Proto.SigningInput.encode(signingInput).finish()]
        },
      }
    )
  }

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

    return [TW.Solana.Proto.SigningInput.encode(input).finish()]
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

    return [TW.Solana.Proto.SigningInput.encode(input).finish()]
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

  return [TW.Solana.Proto.SigningInput.encode(input).finish()]
}
