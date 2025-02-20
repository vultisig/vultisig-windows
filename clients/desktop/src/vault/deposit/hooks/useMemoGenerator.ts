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
}

export const useMemoGenerator = ({
  depositFormData = {},
  selectedChainAction,
  bondableAsset,
  fee,
}: UseMemoGeneratorProps): FieldValues => {
  const memoValue = useMemo(
    () =>
      generateMemo({
        selectedChainAction,
        depositFormData,
        bondableAsset,
        fee,
      }),
    [selectedChainAction, depositFormData, fee, bondableAsset]
  )

  return { ...depositFormData, memo: memoValue }
}
