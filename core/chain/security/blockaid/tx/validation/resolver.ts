import { Resolver } from '@lib/utils/types/Resolver'

import { BlockaidValidationSupportedChain } from '../../validationChains'
import { BlockaidValidation } from './api/core'

export type BlockaidTxValidationInput<
  T extends BlockaidValidationSupportedChain = BlockaidValidationSupportedChain,
> = {
  chain: T
  data: Record<string, unknown>
}

export type BlockaidTxValidationResolver<
  T extends BlockaidValidationSupportedChain = BlockaidValidationSupportedChain,
> = Resolver<BlockaidTxValidationInput<T>, Promise<BlockaidValidation>>
