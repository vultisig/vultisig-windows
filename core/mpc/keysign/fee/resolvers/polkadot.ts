import { polkadotConfig } from '@core/chain/chains/polkadot/config'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getPolkadotFeeAmount: GetFeeAmountResolver = ({
  keysignPayload,
  publicKey: _publicKey,
}) => {
  const { gas } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'polkadotSpecific'
  )

  return gas || polkadotConfig.fee
}
