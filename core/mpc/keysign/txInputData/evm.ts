import { create } from '@bufbuild/protobuf'
import {
  getEvmTwFeeFields,
  GetEvmTwFeeFieldsInput,
} from '@core/chain/chains/evm/tx/fee/tw/getEvmTwFeeFields'
import { getErc20ApproveTxInputData } from '@core/chain/chains/evm/tx/getErc20ApproveTxInputData'
import { incrementKeysignPayloadNonce } from '@core/chain/chains/evm/tx/incrementKeysignPayloadNonce'
import { getEvmTwChainId } from '@core/chain/chains/evm/tx/tw/getEvmTwChainId'
import { getEvmTwNonce } from '@core/chain/chains/evm/tx/tw/getEvmTwNonce'
import { toEvmTwAmount } from '@core/chain/chains/evm/tx/tw/toEvmTwAmount'
import { toEvmTxData } from '@core/chain/chains/evm/tx/tw/toEvmTxData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'

import { KeysignPayloadSchema } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '../swap/KeysignSwapPayload'
import { toTwAddress } from '../tw/toTwAddress'
import { TxInputDataResolver } from './TxInputDataResolver'

const memoToTxData = (memo: string) =>
  memo.startsWith('0x') ? toEvmTxData(memo) : Buffer.from(memo, 'utf8')

export const getEvmTxInputData: TxInputDataResolver<'evm'> = ({
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

  const evmSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'ethereumSpecific'
  )
  const { nonce } = evmSpecific

  const swapPayload = getKeysignSwapPayload(keysignPayload)
  const generalTx =
    swapPayload && 'general' in swapPayload
      ? assertField(shouldBePresent(swapPayload.general.quote), 'tx')
      : undefined

  // DEX/bridge quote values (if present)
  const gasPriceLike = generalTx?.gasPrice
  const gasLike = generalTx?.gas // <-- no gasLimit on OneInch/Kyber tx

  const getToAddress = (): string => {
    if (swapPayload) {
      return matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
        native: ({ vaultAddress, routerAddress }) =>
          coin.isNativeToken ? vaultAddress : shouldBePresent(routerAddress),
        general: ({ quote }) => {
          const q = shouldBePresent(quote)
          const tx = assertField(q, 'tx')
          return assertField(tx, 'to')
        },
      })
    }
    if (coin.isNativeToken) return shouldBePresent(keysignPayload.toAddress)
    return shouldBePresent(coin.contractAddress)
  }

  const getTransaction = (): TW.Ethereum.Proto.ITransaction => {
    if (swapPayload) {
      return matchRecordUnion<
        KeysignSwapPayload,
        TW.Ethereum.Proto.ITransaction
      >(swapPayload, {
        // THORChain-style vault deposit (native & ERC20)
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

          abiFunction.addParamAddress(
            toTwAddress({ address: vaultAddress, walletCore, chain }),
            false
          )
          abiFunction.addParamAddress(
            toTwAddress({
              address: shouldBePresent(fromCoin?.contractAddress),
              walletCore,
              chain,
            }),
            false
          )
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

        // 1inch/bridge “general” quote: take value+data verbatim
        general: ({ quote }) => {
          const q = shouldBePresent(quote)
          const tx = assertField(q, 'tx')
          const value = String(tx.value ?? '0')
          const data = assertField(tx, 'data')

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

    const amount = toEvmTwAmount(shouldBePresent(keysignPayload.toAmount))

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
        to: shouldBePresent(keysignPayload.toAddress),
      }),
    }
  }

  const getFeeFields = () => {
    // If the quote includes gasPrice, produce a Legacy tx
    if (generalTx && gasPriceLike != null) {
      return {
        txMode: TW.Ethereum.Proto.TransactionMode.Legacy,
        gasLimit: toEvmTwAmount(String(gasLike ?? '0')),
        gasPrice: toEvmTwAmount(String(gasPriceLike)),
      }
    }

    // Otherwise compute EIP-1559 from chain defaults or the quote.
    const ffInput: GetEvmTwFeeFieldsInput = {
      chain,
      maxFeePerGasWei: BigInt(shouldBePresent(evmSpecific.maxFeePerGasWei)),
      priorityFee: BigInt(shouldBePresent(evmSpecific.priorityFee)),
      gasLimit: BigInt(shouldBePresent(evmSpecific.gasLimit)),
    }

    if (swapPayload && 'general' in swapPayload) {
      const q = shouldBePresent(swapPayload.general.quote)
      const tx = assertField(q, 'tx')
      if (tx.gas != null) ffInput.gasLimit = BigInt(tx.gas)
      // if tx.gasPrice were present we’d have taken the Legacy branch above
    }

    // Must return fields already in SigningInput shape
    return getEvmTwFeeFields(ffInput)
  }

  const signingInput = TW.Ethereum.Proto.SigningInput.create({
    toAddress: getToAddress(),
    transaction: TW.Ethereum.Proto.Transaction.create(getTransaction()),
    chainId: getEvmTwChainId({ walletCore, chain }),
    nonce: getEvmTwNonce(shouldBePresent(nonce)),
    ...getFeeFields(),
  })

  return [TW.Ethereum.Proto.SigningInput.encode(signingInput).finish()]
}
