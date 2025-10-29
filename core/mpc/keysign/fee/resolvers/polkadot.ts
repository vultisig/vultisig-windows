import { polkadotConfig } from '@core/chain/chains/polkadot/config'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getPolkadotFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { gas } = getBlockchainSpecificValue(
    blockchainSpecific,
    'polkadotSpecific'
  )

  return gas || polkadotConfig.fee
}
