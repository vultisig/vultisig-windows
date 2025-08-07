import { productRootDomain } from '@core/config'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getSolanaSendTxInputData } from '@core/mpc/keysign/txInputData/solana/send'
import { assertField } from '@lib/utils/record/assertField'

import { BlockaidTxScanInputResolver } from '../resolver'

export const getSolanaBlockaidTxScanInput: BlockaidTxScanInputResolver = ({
  payload,
  walletCore,
}) => {
  const coin = assertField(payload, 'coin')

  const swapPayload = getKeysignSwapPayload(payload)

  if (swapPayload) {
    return null
  }

  const transaction = Buffer.from(
    getSolanaSendTxInputData({
      keysignPayload: payload,
      walletCore,
    })
  ).toString('base64')

  return {
    data: {
      chain: 'mainnet',
      metadata: { url: productRootDomain },
      options: ['validation'],
      account_address: coin.address,
      encoding: 'base58',
      transactions: [transaction],
      method: 'signAndSendTransaction',
    },
  }
}
