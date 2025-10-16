import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { useMemo } from 'react'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositData } from '../state/data'

export const useDepositAmount = () => {
  const depositData = useDepositData()
  const [{ decimals }] = useDepositCoin()

  return useMemo(() => {
    if ('amount' in depositData) {
      return toChainAmount(Number(depositData['amount']), decimals)
    }

    return undefined
  }, [decimals, depositData])
}
