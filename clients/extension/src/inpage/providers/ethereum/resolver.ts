import { Resolver } from '@lib/utils/types/Resolver'

export type EthereumResolver<TInput = any, TOutput = any> = Resolver<
  TInput,
  Promise<TOutput>
>
