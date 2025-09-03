import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../Chain'
import { SigningOutput } from '../../tw/signingOutput'

export type BroadcastTxResolver<T extends Chain = Chain> = Resolver<
  {
    chain: T
    tx: SigningOutput<T>
  },
  Promise<unknown>
>
