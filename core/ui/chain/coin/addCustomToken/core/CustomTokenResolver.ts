import { ChainAccount } from '@core/chain/ChainAccount'
import { Coin } from '@core/chain/coin/Coin'
import { Resolver } from '@lib/utils/types/Resolver'

import { CustomTokenEnabledChain } from './chains'

export type CustomTokenResolver<
  T extends CustomTokenEnabledChain = CustomTokenEnabledChain,
> = Resolver<ChainAccount<T>, Promise<Coin>>
