import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

export type BroadcastTxResolver<T extends Chain = Chain> = Resolver<
  {
    chain: T
    tx: DecodedTx<T>
  },
  Promise<unknown>
>
