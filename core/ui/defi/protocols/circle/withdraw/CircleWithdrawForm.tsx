import { DefiAmountForm } from '@core/ui/defi/shared/DefiAmountForm'
import { OnFinishProp } from '@lib/ui/props'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'

import { useCircleAccountUsdcBalanceQuery } from '../queries/circleAccountUsdcBalance'

export const CircleWithdrawForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const balanceQuery = useCircleAccountUsdcBalanceQuery()

  return (
    <DefiAmountForm
      balanceQuery={balanceQuery}
      ticker={usdc.ticker}
      decimals={usdc.decimals}
      onFinish={onFinish}
    />
  )
}
