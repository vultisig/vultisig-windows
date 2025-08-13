import { Resolver } from '@lib/utils/types/Resolver'

import { BlockaidSupportedChain } from '../../chains'
import { BlockaidValidation } from './api/core'

export type BlockaidTxValidationInput<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = {
  chain: T
  data: Record<string, unknown>
}

export type BlockaidTxValidationResolver<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = Resolver<BlockaidTxValidationInput<T>, Promise<BlockaidValidation>>
