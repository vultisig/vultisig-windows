import { Chain } from '@core/chain/Chain'
import { useMemo } from 'react'
import { FieldValues } from 'react-hook-form'

import { MayaChainPool } from '../../../lib/types/deposit'
import { ChainAction } from '../ChainAction'
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
  const memoValue = useMemo(
    () =>
      generateMemo({
        selectedChainAction,
        depositFormData,
        bondableAsset,
        chain,
      }),
    [selectedChainAction, depositFormData, bondableAsset, chain]
  )

  return { ...depositFormData, memo: memoValue }
}
