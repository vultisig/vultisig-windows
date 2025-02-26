import { getSigningInputEnvelopedTxFields } from '@core/chain/chains/evm/tx/getSigningInputEnvelopedTxFields'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'

import { PreSignedInputDataResolver } from './PreSignedInputDataResolver'

const toTransferData = (memo: string | undefined) => {
  if (memo && memo.startsWith('0x')) {
    return Buffer.from(stripHexPrefix(memo), 'hex')
  }

  return Buffer.from(memo ?? '', 'utf8')
}

export const getEvmPreSignedInputData: PreSignedInputDataResolver<
  'ethereumSpecific'
> = ({ keysignPayload, walletCore, chain, chainSpecific }) => {
  const coin = assertField(keysignPayload, 'coin')

  const { gasLimit, maxFeePerGasWei, nonce, priorityFee } = chainSpecific

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

  return TW.Ethereum.Proto.SigningInput.encode(input).finish()
}
