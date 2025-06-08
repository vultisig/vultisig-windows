import { getSigningInputEnvelopedTxFields } from '@core/chain/chains/evm/tx/getSigningInputEnvelopedTxFields'
import {
  toTwAmount,
  toTwTransferData,
} from '@core/chain/chains/evm/tx/trustwallet'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'

import { PreSignedInputDataResolver } from './PreSignedInputDataResolver'

export const getEvmPreSignedInputData: PreSignedInputDataResolver<
  'ethereumSpecific'
> = ({ keysignPayload, walletCore, chain, chainSpecific }) => {
  const coin = assertField(keysignPayload, 'coin')

  const { gasLimit, maxFeePerGasWei, nonce, priorityFee } = chainSpecific

  // Amount: converted to hexadecimal, stripped of '0x'
  const amountHex = toTwAmount(keysignPayload.toAmount)

  // Send native tokens
  let toAddress = keysignPayload.toAddress
  let evmTransaction = TW.Ethereum.Proto.Transaction.create({
    transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
      amount: amountHex,
      data: toTwTransferData(keysignPayload.memo),
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

  return TW.Ethereum.Proto.SigningInput.encode(input).finish()
}
