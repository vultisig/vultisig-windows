import { Chain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { omit } from '@lib/utils/record/omit'
import { useCallback, useMemo } from 'react'

type FeeSettings = EvmFeeSettings | UtxoFeeSettings
import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'

type FeeSettingsRecord = Record<string, FeeSettings>

type FeeSettingsKey = {
  chain: Chain
  isNativeToken: boolean
}

const feeSettingsKeyToString = (key: FeeSettingsKey): string =>
  `${key.chain}:${key.isNativeToken}`

const { useState: useFeeSettingsRecord, provider: FeeSettingsRecordProvider } =
  getStateProviderSetup<FeeSettingsRecord>('FeeSettings')

export const FeeSettingsProvider = ({ children }: ChildrenProp) => (
  <FeeSettingsRecordProvider initialValue={{}}>
    {children}
  </FeeSettingsRecordProvider>
)

export const useFeeSettings = <T extends FeeSettings>() => {
  const [{ coin }] = useCoreViewState<'send'>()
  const [record, setRecord] = useFeeSettingsRecord()

  const value = useMemo(() => {
    const stringKey = feeSettingsKeyToString({
      chain: coin.chain,
      isNativeToken: isFeeCoin(coin),
    })

    if (stringKey in record) {
      return record[stringKey] as T
    }

    return null
  }, [coin, record])

  const setValue = useCallback(
    (value: T | null) => {
      const stringKey = feeSettingsKeyToString({
        chain: coin.chain,
        isNativeToken: isFeeCoin(coin),
      })

      setRecord(record => {
        if (value) {
          return {
            ...record,
            [stringKey]: value,
          }
        }

        return omit(record, stringKey)
      })
    },
    [coin, setRecord]
  )

  return [value, setValue] as const
}
