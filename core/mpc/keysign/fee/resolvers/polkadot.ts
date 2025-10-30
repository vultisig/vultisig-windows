import { polkadotConfig } from '@core/chain/chains/polkadot/config'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getPolkadotFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { gas } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'polkadotSpecific'
  )

  return gas || polkadotConfig.fee
}
