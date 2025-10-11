import type { FeeSettings } from '@core/chain/feeQuote/settings/core'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { omit } from '@lib/utils/record/omit'
import { useCallback } from 'react'

import { useCurrentSendCoin } from '../../../state/sendCoin'

type FeeSettingsRecord = Record<string, FeeSettings>

const { useState: useFeeSettingsRecord, provider: FeeSettingsRecordProvider } =
  getStateProviderSetup<FeeSettingsRecord>('FeeSettings')

export const FeeSettingsProvider = ({ children }: ChildrenProp) => (
  <FeeSettingsRecordProvider initialValue={{}}>
    {children}
  </FeeSettingsRecordProvider>
)

export const useFeeSettings = <T extends FeeSettings>() => {
  const { chain } = useCurrentSendCoin()
  const [record, setRecord] = useFeeSettingsRecord()

  const value = record[chain] as T | null

  const setValue = useCallback(
    (value: T | null) => {
      setRecord(record => {
        if (value) {
          return {
            ...record,
            [chain]: value,
          }
        }

        return omit(record, chain)
      })
    },
    [chain, setRecord]
  )

  return [value, setValue] as const
}
