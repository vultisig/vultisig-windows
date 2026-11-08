import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Coin } from '@vultisig/core-chain/coin/Coin'

import { CoinOption } from '../../../../../../../chain/coin/inputs/CoinOption'

/** A payout asset row, naming the asset's chain. */
export const PayoutAssetOption = ({
  value,
  onClick,
}: ValueProp<Coin> & OnClickProp) => (
  <CoinOption onClick={onClick} showChain value={value} />
)
