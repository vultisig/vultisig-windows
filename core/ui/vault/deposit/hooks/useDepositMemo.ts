import { useMemo } from 'react'

import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositData } from '../state/data'
import { generateMemo } from '../utils/memoGenerator'

export const useDepositMemo = (): string => {
  const [depositCoin] = useDepositCoin()
  const [selectedChainAction] = useDepositAction()
  const depositData = useDepositData()

  return useMemo(
    () =>
      generateMemo({
        coin: depositCoin,
        selectedChainAction,
        depositFormData: depositData,
        bondableAsset: depositData?.bondableAsset,
        chain: depositCoin?.chain,
      }),
    [depositCoin, selectedChainAction, depositData]
  )
}
