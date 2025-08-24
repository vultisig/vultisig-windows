import { Chain } from '@core/chain/Chain'
import { useMemo } from 'react'
import { FieldValues } from 'react-hook-form'

import { ChainAction } from '../ChainAction'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { MayaChainPool } from '../types/mayaChain'
import { generateMemo } from '../utils/memoGenerator'

type UseMemoGeneratorProps = {
  depositFormData: FieldValues
  selectedChainAction: ChainAction
  bondableAsset: MayaChainPool['asset']
  fee?: number | bigint
  chain: Chain
}

export const useMemoGenerator = ({
  depositFormData = {},
  selectedChainAction,
  bondableAsset,
  chain,
}: UseMemoGeneratorProps): FieldValues => {
  const [depositCoin] = useDepositCoin()
  const memoValue = useMemo(
    () =>
      generateMemo({
        coin: depositCoin,
        selectedChainAction,
        depositFormData,
        bondableAsset,
        chain,
      }),
    [depositCoin, selectedChainAction, depositFormData, bondableAsset, chain]
  )

  return { ...depositFormData, memo: memoValue }
}
