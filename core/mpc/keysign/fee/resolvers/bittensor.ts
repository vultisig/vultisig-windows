import { bittensorConfig } from '@core/chain/chains/bittensor/config'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getBittensorFeeAmount: FeeAmountResolver = ({
  keysignPayload,
}) => {
  const { gas } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'polkadotSpecific'
  )

  return gas || bittensorConfig.fee
}
