import { create } from '@bufbuild/protobuf'
import { getErc20ApproveTxInputData } from '@core/chain/chains/evm/tx/getErc20ApproveTxInputData'
import {
  EnvelopedTxFeeFields,
  getSigningInputEnvelopedTxFields,
} from '@core/chain/chains/evm/tx/getSigningInputEnvelopedTxFields'
import {
  getSigningInputLegacyTxFields,
  LegacyTxFeeFields,
} from '@core/chain/chains/evm/tx/getSigningInputLegacyTxFields'
import { incrementKeysignPayloadNonce } from '@core/chain/chains/evm/tx/incrementKeysignPayloadNonce'
import { getEvmTwChainId } from '@core/chain/chains/evm/tx/tw/getEvmTwChainId'
import { getEvmTwNonce } from '@core/chain/chains/evm/tx/tw/getEvmTwNonce'
import { toEvmTwAmount } from '@core/chain/chains/evm/tx/tw/toEvmTwAmount'
import { toEvmTxData } from '@core/chain/chains/evm/tx/tw/toEvmTxData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import { encodeFunctionData } from 'viem'

import { KeysignPayloadSchema } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { getKeysignSwapPayload } from '../swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '../swap/KeysignSwapPayload'
import { TxInputDataResolver } from './TxInputDataResolver'

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

  const swapPayload = getKeysignSwapPayload(keysignPayload)

  const getToAddress = () => {
    if (swapPayload) {
      return matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
        native: ({ vaultAddress, routerAddress }) =>
          coin.isNativeToken ? vaultAddress : shouldBePresent(routerAddress),
        general: ({ quote }) => shouldBePresent(quote?.tx?.to),
      })
    }

    if (coin.isNativeToken) {
      return keysignPayload.toAddress
    }

    return coin.contractAddress
  }

  const getTransaction = (): TW.Ethereum.Proto.ITransaction => {
    if (swapPayload) {
      return matchRecordUnion<
        KeysignSwapPayload,
        TW.Ethereum.Proto.ITransaction
      >(swapPayload, {
        native: ({ fromCoin, fromAmount, vaultAddress, expirationTime }) => {
          const { isNativeToken } = shouldBePresent(fromCoin)

          if (isNativeToken) {
            return {
              transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
                amount: toEvmTwAmount(fromAmount),
                data: toEvmTxData(shouldBePresent(keysignPayload.memo)),
              }),
            }
          }

          const contractAddress = shouldBePresent(fromCoin?.contractAddress)

          const data = encodeFunctionData({
            abi: [
              {
                name: 'depositWithExpiry',
                type: 'function',
                inputs: [
                  { name: 'vault', type: 'address' },
                  { name: 'asset', type: 'address' },
                  { name: 'amount', type: 'uint256' },
                  { name: 'memo', type: 'string' },
                  { name: 'expiration', type: 'uint256' },
                ],
              },
            ],
            functionName: 'depositWithExpiry',
            args: [
              vaultAddress as `0x${string}`,
              contractAddress as `0x${string}`,
              BigInt(fromAmount),
              shouldBePresent(keysignPayload.memo),
              expirationTime,
            ],
          })

          return {
            contractGeneric: {
              amount: toEvmTwAmount(0),
              data: toEvmTxData(data),
            },
          }
        },
        general: ({ quote }) => {
          const { data, value } = shouldBePresent(quote?.tx)

          return {
            contractGeneric: {
              amount: toEvmTwAmount(value),
              data: toEvmTxData(data),
            },
          }
        },
      })
    }

    const amount = toEvmTwAmount(keysignPayload.toAmount)

    if (coin.isNativeToken) {
      return {
        transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
          amount,
          data: keysignPayload.memo
            ? toEvmTxData(shouldBePresent(keysignPayload.memo))
            : undefined,
        }),
      }
    }

    return {
      erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
        amount,
        to: keysignPayload.toAddress,
      }),
    }
  }

  const getFeeFields = (): LegacyTxFeeFields | EnvelopedTxFeeFields => {
    if (swapPayload && 'general' in swapPayload) {
      const { gasPrice, gas } = shouldBePresent(swapPayload.general.quote?.tx)

      return getSigningInputLegacyTxFields({
        gasPrice: BigInt(gasPrice || 0),
        gasLimit: BigInt(gas),
      })
    }

    return getSigningInputEnvelopedTxFields({
      maxFeePerGasWei: maxFeePerGasWei,
      priorityFee: priorityFee,
      gasLimit: gasLimit,
    })
  }

  const input = TW.Ethereum.Proto.SigningInput.create({
    toAddress: getToAddress(),
    transaction: TW.Ethereum.Proto.Transaction.create(getTransaction()),
    chainId: getEvmTwChainId({
      walletCore,
      chain,
    }),
    nonce: getEvmTwNonce(nonce),
    ...getFeeFields(),
  })

  return [TW.Ethereum.Proto.SigningInput.encode(input).finish()]
}
