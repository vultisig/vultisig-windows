import { ChainAccount } from '@core/chain/ChainAccount'
import { Coin } from '@core/chain/coin/Coin'

import { CustomTokenEnabledChain } from './chains'

export type CustomTokenResolver<
  T extends CustomTokenEnabledChain = CustomTokenEnabledChain,
> = (input: ChainAccount<T>) => Promise<Coin>
