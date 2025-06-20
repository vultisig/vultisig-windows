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
import { getCoinType } from '@core/chain/coin/coinType'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'

import { KeysignPayloadSchema } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '../swap/KeysignSwapPayload'
import { TxInputDataResolver } from './TxInputDataResolver'

const memoToTxData = (memo: string) =>
  memo.startsWith('0x') ? toEvmTxData(memo) : Buffer.from(memo, 'utf8')

export const getEvmTxInputData: TxInputDataResolver<'ethereumSpecific'> = ({
  keysignPayload,
  walletCore,
  chain,
}) => {
  const coin = assertField(keysignPayload, 'coin')

  const { erc20ApprovePayload, ...restOfKeysignPayload } = keysignPayload
  if (erc20ApprovePayload) {
    const approveTxInputData = getErc20ApproveTxInputData({
      keysignPayload,
      walletCore,
    })

    const restOfTxInputData = getEvmTxInputData({
      keysignPayload: incrementKeysignPayloadNonce(
        create(KeysignPayloadSchema, restOfKeysignPayload)
      ),
      walletCore,
      chain,
    })

    return [approveTxInputData, ...restOfTxInputData]
  }

  const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
    getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'ethereumSpecific'
    )

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

          const memo = shouldBePresent(keysignPayload.memo)

          if (isNativeToken) {
            return {
              transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
                amount: toEvmTwAmount(fromAmount),
                data: memoToTxData(memo),
              }),
            }
          }

          const abiFunction =
            walletCore.EthereumAbiFunction.createWithString('depositWithExpiry')

          const coinType = getCoinType({
            walletCore,
            chain,
          })

          const vaultAddr = walletCore.AnyAddress.createWithString(
            vaultAddress,
            coinType
          )
          const contractAddr = walletCore.AnyAddress.createWithString(
            shouldBePresent(fromCoin?.contractAddress),
            coinType
          )

          abiFunction.addParamAddress(vaultAddr.data(), false)
          abiFunction.addParamAddress(contractAddr.data(), false)
          abiFunction.addParamUInt256(toEvmTwAmount(fromAmount), false)
          abiFunction.addParamString(memo, false)
          abiFunction.addParamUInt256(toEvmTwAmount(expirationTime), false)

          const data = walletCore.EthereumAbi.encode(abiFunction)

          return {
            contractGeneric:
              TW.Ethereum.Proto.Transaction.ContractGeneric.create({
                amount: toEvmTwAmount(0),
                data,
              }),
          }
        },
        general: ({ quote }) => {
          const { data, value } = shouldBePresent(quote?.tx)

          return {
            contractGeneric:
              TW.Ethereum.Proto.Transaction.ContractGeneric.create({
                amount: toEvmTwAmount(value),
                data: toEvmTxData(data),
              }),
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
            ? memoToTxData(shouldBePresent(keysignPayload.memo))
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
