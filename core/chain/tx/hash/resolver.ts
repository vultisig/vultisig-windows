import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../Chain'
import { SigningOutput } from '../../tw/signingOutput'

export type TxHashResolver<T extends Chain = Chain> = Resolver<
  SigningOutput<T>,
  Promise<string> | string
>
