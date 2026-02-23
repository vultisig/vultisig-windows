import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../Chain'

export type TxStatus = 'pending' | 'success' | 'error'

export type TxStatusResolver<T extends Chain = Chain> = Resolver<
  {
    chain: T
    hash: string
  },
  Promise<TxStatus>
>
