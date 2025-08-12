import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

export type TxHashResolver<T extends Chain = Chain> = Resolver<
  DecodedTx<T>,
  Promise<string> | string
>
