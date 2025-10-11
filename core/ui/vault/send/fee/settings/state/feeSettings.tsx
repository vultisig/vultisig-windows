import { ChainKind } from '@core/chain/ChainKind'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { TronFeeSettings } from '@core/chain/tx/fee/tron/tronFeeSettings'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { omit } from '@lib/utils/record/omit'
import { useCallback } from 'react'

import { useCurrentSendCoin } from '../../../state/sendCoin'

export const feeSettingsChainKinds = [
  'evm',
  'utxo',
  'tron',
] as const satisfies ChainKind[]

type FeeSettingsChainKind = (typeof feeSettingsChainKinds)[number]

export type FeeSettings<T extends FeeSettingsChainKind = FeeSettingsChainKind> =
  T extends 'evm'
    ? EvmFeeSettings
    : T extends 'tron'
      ? TronFeeSettings
      : UtxoFeeSettings

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
