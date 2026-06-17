import { DefiAmountForm } from '@core/ui/defi/shared/DefiAmountForm'
import { OnFinishProp } from '@lib/ui/props'

import { vultCoin } from '../core/config'
import { useVultBalanceQuery } from '../queries/useVultBalanceQuery'

export const VultStakeForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const balanceQuery = useVultBalanceQuery()

  return (
    <DefiAmountForm
      balanceQuery={balanceQuery}
      ticker={vultCoin.ticker}
      decimals={vultCoin.decimals}
      onFinish={onFinish}
    />
  )
}
