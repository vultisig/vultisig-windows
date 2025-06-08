import { getSigningInputEnvelopedTxFields } from '@core/chain/chains/evm/tx/getSigningInputEnvelopedTxFields'
import {
  toTwAmount,
  toTwTransferData,
} from '@core/chain/chains/evm/tx/trustwallet'
import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { TW } from '@trustwallet/wallet-core'

import { ThorChainSwapEnabledEvmChain } from '../../NativeSwapChain'
import { ThorchainSwapTxInputDataResolver } from './ThorchainSwapTxInputDataResolver'

export const getEvmThorchainSwapTxInputData: ThorchainSwapTxInputDataResolver<
  ThorChainSwapEnabledEvmChain
> = ({ keysignPayload, walletCore, chain, swapPayload }) => {
  const { blockchainSpecific } = keysignPayload

  const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
    blockchainSpecific.value as EthereumSpecific

  const input = TW.Ethereum.Proto.SigningInput.create({
    toAddress: swapPayload.vaultAddress,
    transaction: TW.Ethereum.Proto.Transaction.create({
      transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
        amount: toTwAmount(keysignPayload.toAmount),
        data: toTwTransferData(keysignPayload.memo),
      }),
    }),
    ...getSigningInputEnvelopedTxFields({
      chain,
      walletCore,
      maxFeePerGasWei,
      priorityFee,
      nonce,
      gasLimit,
    }),
  })

  return TW.Ethereum.Proto.SigningInput.encode(input).finish()
}
