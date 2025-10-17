import { useKeysignTxDataQuery } from '@core/ui/mpc/keysign/txData/query'

import { useDepositAmount } from '../hooks/useDepositAmount'
import { useDepositReceiver } from '../hooks/useDepositReceiver'
import { useDepositTxType } from '../hooks/useDepositTxType'
import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useDepositKeysignTxDataQuery = () => {
  const [coin] = useDepositCoin()
  const receiver = useDepositReceiver()
  const amount = useDepositAmount()
  const transactionType = useDepositTxType()

  return useKeysignTxDataQuery({
    coin,
    receiver,
    amount,
    transactionType,
    isDeposit: true,
  })
}
