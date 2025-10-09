import { Chain } from '@core/chain/Chain'
import { ChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

type FeeQuoteQueryInput<C extends Chain = Chain> = {
  coin: AccountCoin<C>
} & (C extends ChainOfKind<'evm'>
  ? {
      amount: bigint
      receiver?: string
      data?: string
      thirdPartyGasLimitEstimation?: boolean
    }
  : {})

export const useFeeQuoteQuery = () => {}
