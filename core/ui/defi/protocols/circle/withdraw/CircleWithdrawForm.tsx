import { OnFinishProp } from '@lib/ui/props'

import { useCircleAccountUsdcBalanceQuery } from '../queries/circleAccountUsdcBalance'
import { CircleAmountForm } from '../shared/CircleAmountForm'

export const CircleWithdrawForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const balanceQuery = useCircleAccountUsdcBalanceQuery()

  return <CircleAmountForm balanceQuery={balanceQuery} onFinish={onFinish} />
}
