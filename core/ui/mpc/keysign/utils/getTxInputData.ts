import { create } from '@bufbuild/protobuf'
import { getErc20ApproveTxInputData } from '@core/chain/chains/evm/tx/getErc20ApproveTxInputData'
import { incrementKeysignPayloadNonce } from '@core/chain/chains/evm/tx/incrementKeysignPayloadNonce'
import { getOneInchSwapTxInputData } from '@core/chain/swap/general/oneInch/tx/getOneInchSwapTxInputData'
import { getThorchainSwapTxInputData } from '@core/chain/swap/native/thor/tx/getThorchainSwapTxInputData'
import { IMsgTransfer } from '@core/mpc/keysign/preSignedInputData/ibc/IMsgTransfer'
import { getPreSignedInputData } from '@core/mpc/keysign/preSignedInputData/index'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignChain } from './getKeysignChain'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  ibcTransaction?: IMsgTransfer
}

export const getTxInputData = async ({
  keysignPayload,
  walletCore,
  ibcTransaction,
}: Input): Promise<Uint8Array[]> => {
  const chain = getKeysignChain(keysignPayload)

  const { erc20ApprovePayload, ...restOfKeysignPayload } = keysignPayload
  if (erc20ApprovePayload) {
    const approveTxInputData = getErc20ApproveTxInputData({
      keysignPayload,
      walletCore,
    })

    const restOfTxInputData = await getTxInputData({
      keysignPayload: incrementKeysignPayloadNonce(
        create(KeysignPayloadSchema, restOfKeysignPayload)
      ),
      walletCore,
    })

    return [approveTxInputData, ...restOfTxInputData]
  }

  if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
    const txInputData: Uint8Array = await matchDiscriminatedUnion(
      keysignPayload.swapPayload,
      'case',
      'value',
      {
        thorchainSwapPayload: () =>
          getThorchainSwapTxInputData({
            keysignPayload,
            walletCore,
          }),
        mayachainSwapPayload: () => {
          throw new Error('Mayachain swap not supported')
        },
        oneinchSwapPayload: () =>
          getOneInchSwapTxInputData({
            keysignPayload,
            walletCore,
          }),
      }
    )

    return [txInputData]
  }

  const txInputData = getPreSignedInputData({
    keysignPayload,
    walletCore,
    chain,
    ibcTransaction,
  })

  return [txInputData]
}
