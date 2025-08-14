import { getTxInputData } from '@core/mpc/keysign/txInputData'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'

import { UtxoChain } from '../../../../../../Chain'
import { getPreSigningHashes } from '../../../../../../tx/preSigningHashes'
import { BlockaidTxValidationInputResolver } from '../resolver'

export const getUtxoBlockaidTxValidationInput: BlockaidTxValidationInputResolver<
  UtxoChain.Bitcoin
> = ({ payload, walletCore, chain }) => {
  const { address } = getKeysignCoin(payload)

  const [txInputData] = getTxInputData({
    keysignPayload: payload,
    walletCore,
  })

  const [preHash] = getPreSigningHashes({
    walletCore,
    txInputData,
    chain,
  })

  return {
    chain: chain.toLowerCase(),
    options: ['validation'],
    account_address: address,
    transaction: Buffer.from(preHash).toString('hex'),
    metadata: {},
  }
}
