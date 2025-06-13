import { create } from '@bufbuild/protobuf'
import { getErc20ApproveTxInputData } from '@core/chain/chains/evm/tx/getErc20ApproveTxInputData'
import { getSigningInputEnvelopedTxFields } from '@core/chain/chains/evm/tx/getSigningInputEnvelopedTxFields'
import { getSigningInputLegacyTxFields } from '@core/chain/chains/evm/tx/getSigningInputLegacyTxFields'
import { incrementKeysignPayloadNonce } from '@core/chain/chains/evm/tx/incrementKeysignPayloadNonce'
import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'
import { toThorchainSwapAssetProto } from '@core/chain/swap/native/thor/asset/toThorchainSwapAssetProto'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { fromCommCoin } from '../../types/utils/commCoin'
import { KeysignPayloadSchema } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { TxInputDataResolver } from './TxInputDataResolver'

const toTransferData = (memo: string | undefined) => {
  if (memo && memo.startsWith('0x')) {
    return Buffer.from(stripHexPrefix(memo), 'hex')
  }

  return Buffer.from(memo ?? '', 'utf8')
}

export const getEvmTxInputData: TxInputDataResolver<
  'ethereumSpecific'
> = async ({ keysignPayload, walletCore, chain, chainSpecific }) => {
  const coin = assertField(keysignPayload, 'coin')

  const { erc20ApprovePayload, ...restOfKeysignPayload } = keysignPayload
  if (erc20ApprovePayload) {
    const approveTxInputData = getErc20ApproveTxInputData({
      keysignPayload,
      walletCore,
    })

    const restOfTxInputData = await getEvmTxInputData({
      keysignPayload: incrementKeysignPayloadNonce(
        create(KeysignPayloadSchema, restOfKeysignPayload)
      ),
      walletCore,
      chainSpecific,
      chain,
    })

    return [approveTxInputData, ...restOfTxInputData]
  }

  const { maxFeePerGasWei, priorityFee, nonce, gasLimit } = chainSpecific

  if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
    return matchDiscriminatedUnion(
      keysignPayload.swapPayload,
      'case',
      'value',
      {
        thorchainSwapPayload: swapPayload => {
          const fromCoin = fromCommCoin(shouldBePresent(swapPayload.fromCoin))

          const toCoin = fromCommCoin(shouldBePresent(swapPayload.toCoin))

          const swapInput = TW.THORChainSwap.Proto.SwapInput.create({
            fromAsset: toThorchainSwapAssetProto({
              ...fromCoin,
              direction: 'from',
            }),
            fromAddress: swapPayload.fromAddress,
            toAsset: toThorchainSwapAssetProto({
              ...toCoin,
              direction: 'to',
            }),
            toAddress: swapPayload.toCoin?.address,
            vaultAddress: swapPayload.vaultAddress,
            routerAddress: swapPayload.routerAddress,
            fromAmount: swapPayload.fromAmount,
            toAmountLimit: swapPayload.toAmountLimit,
            expirationTime: new Long(Number(swapPayload.expirationTime)),
            streamParams: {
              interval: swapPayload.streamingInterval,
              quantity: swapPayload.streamingQuantity,
            },
            ...(swapPayload.isAffiliate
              ? {
                  affiliateFeeAddress:
                    nativeSwapAffiliateConfig.affiliateFeeAddress,
                  affiliateFeeRateBps:
                    nativeSwapAffiliateConfig.affiliateFeeRateBps,
                }
              : {}),
          })

          const swapInputData =
            TW.THORChainSwap.Proto.SwapInput.encode(swapInput).finish()

          const swapOutputData =
            walletCore.THORChainSwap.buildSwap(swapInputData)

          const swapOutput =
            TW.THORChainSwap.Proto.SwapOutput.decode(swapOutputData)

          if (swapOutput.error?.message) {
            throw new Error(swapOutput.error.message)
          }

          const signingInput = TW.Ethereum.Proto.SigningInput.create({
            ...shouldBePresent(swapOutput.ethereum),
            ...getSigningInputEnvelopedTxFields({
              chain,
              walletCore,
              maxFeePerGasWei,
              priorityFee,
              nonce,
              gasLimit,
            }),
          })

          return [TW.Ethereum.Proto.SigningInput.encode(signingInput).finish()]
        },
        mayachainSwapPayload: () => {
          throw new Error('Mayachain swap not supported')
        },
        oneinchSwapPayload: swapPayload => {
          const tx = shouldBePresent(swapPayload.quote?.tx)
          const { data } = tx

          const amountHex = Buffer.from(
            stripHexPrefix(bigIntToHex(BigInt(tx.value || 0))),
            'hex'
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
              chain,
              walletCore,
              nonce,
              gasPrice: BigInt(tx.gasPrice || 0),
              gasLimit: BigInt(tx.gas),
            }),
          })

          return [TW.Ethereum.Proto.SigningInput.encode(signingInput).finish()]
        },
      }
    )
  }

  // Amount: converted to hexadecimal, stripped of '0x'
  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
    'hex'
  )

  // Send native tokens
  let toAddress = keysignPayload.toAddress
  let evmTransaction = TW.Ethereum.Proto.Transaction.create({
    transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
      amount: amountHex,
      data: toTransferData(keysignPayload.memo),
    }),
  })

  // Send ERC20 tokens, it will replace the transaction object
  if (!coin.isNativeToken) {
    toAddress = coin.contractAddress
    evmTransaction = TW.Ethereum.Proto.Transaction.create({
      erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
        amount: amountHex,
        to: keysignPayload.toAddress,
      }),
    })
  }

  // Create the signing input with the constants
  const input = TW.Ethereum.Proto.SigningInput.create({
    toAddress: toAddress,
    transaction: evmTransaction,
    ...getSigningInputEnvelopedTxFields({
      chain,
      walletCore,
      maxFeePerGasWei: maxFeePerGasWei,
      priorityFee: priorityFee,
      nonce: nonce,
      gasLimit: gasLimit,
    }),
  })

  return [TW.Ethereum.Proto.SigningInput.encode(input).finish()]
}
