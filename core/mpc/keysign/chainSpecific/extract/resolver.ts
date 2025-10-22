import { Chain } from '@core/chain/Chain'
import { DeriveChainKind } from '@core/chain/ChainKind'
import { FeeQuote, FeeQuoteForChain } from '@core/chain/feeQuote/core'
import { Resolver } from '@lib/utils/types/Resolver'

import {
  ChainsBySpecific,
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from '../KeysignChainSpecific'

export type ExtractFeeQuoteResolver<C extends Chain = Chain> = Resolver<
  { chain: C; blockchainSpecific: KeysignChainSpecific },
  FeeQuoteForChain<C>
>

type ValueForCase<C extends KeysignChainSpecificKey> = Extract<
  KeysignChainSpecific,
  { case: C }
>['value']

type ExtractInputByCase<
  CS extends KeysignChainSpecificKey,
  SC extends Chain = ChainsBySpecific<CS>,
> = {
  chain: SC
  value: ValueForCase<CS>
}

export type ExtractFeeQuoteByCaseResolver<C extends KeysignChainSpecificKey> =
  Resolver<
    ExtractInputByCase<C>,
    FeeQuote<DeriveChainKind<ChainsBySpecific<C>>>
  >
