import { Chain } from '@core/chain/Chain'
import { DeriveChainKind } from '@core/chain/ChainKind'
import { FeeQuote, FeeQuoteForChain } from '@core/chain/feeQuote/core'
import { Resolver } from '@lib/utils/types/Resolver'

import { KeysignTxData, KeysignTxDataForChain } from '../../txData/core'
import {
  ChainsBySpecific,
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from '../KeysignChainSpecific'

export type BuildChainSpecificInput<C extends Chain = Chain> = {
  chain: C
  txData: KeysignTxDataForChain<C>
  feeQuote: FeeQuoteForChain<C>
}

type ValueForCase<C extends KeysignChainSpecificKey> = Extract<
  KeysignChainSpecific,
  { case: C }
>['value']

type BuildInputByCase<
  CS extends KeysignChainSpecificKey,
  SC extends Chain = ChainsBySpecific<CS>,
> = {
  chain: SC
  txData: KeysignTxData<DeriveChainKind<SC>>
  feeQuote: FeeQuote<DeriveChainKind<SC>>
}

export type BuildChainSpecificResolver<C extends KeysignChainSpecificKey> =
  Resolver<BuildInputByCase<C>, ValueForCase<C>>
