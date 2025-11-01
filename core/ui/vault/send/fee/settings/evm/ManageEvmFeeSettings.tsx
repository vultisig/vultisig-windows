import { EvmChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { deriveEvmGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { useEvmBaseFeeQuery } from '@core/ui/chain/evm/queries/baseFee'
import { useEvmMaxPriorityFeePerGasQuery } from '@core/ui/chain/evm/queries/maxPriorityFeePerGas'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FailedQueryOverlay } from '@lib/ui/query/components/overlay/FailedQueryOverlay'
import { PendingQueryOverlay } from '@lib/ui/query/components/overlay/PendingQueryOverlay'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { StrictText } from '@lib/ui/text'
import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EvmFeeSettingsForm } from './EvmFeeSettingsForm'

type ManageEvmFeeSettingsProps = OnCloseProp & {
  chain: EvmChain
}

export const ManageEvmFeeSettings: FC<ManageEvmFeeSettingsProps> = ({
  onClose,
  chain,
}) => {
  const { t } = useTranslation()
  const [persistentValue, setPersistentValue] = useFeeSettings<EvmFeeSettings>()

  const baseFeeQuery = useEvmBaseFeeQuery(chain)
  const priorityFeeQuery = useEvmMaxPriorityFeePerGasQuery(chain)

  const defaultGasLimit = deriveEvmGasLimit({
    coin: chainFeeCoin[chain] as { chain: EvmChain },
    data: undefined,
  })

  const [value, setValue] = useState<EvmFeeSettings>(() => {
    if (persistentValue) return persistentValue

    return {
      maxPriorityFeePerGas: priorityFeeQuery.data ?? 0n,
      gasLimit: defaultGasLimit,
    }
  })

  const handleSave = () => {
    setPersistentValue(value)
    onClose()
  }

  const queries = useTransformQueriesData(
    {
      baseFee: baseFeeQuery,
      priorityFee: priorityFeeQuery,
    },
    useCallback(
      ({ baseFee, priorityFee }) => ({
        baseFeePerGas: baseFee,
        maxPriorityFeePerGas: priorityFee,
      }),
      []
    )
  )

  return (
    <MatchQuery
      value={queries}
      success={({ baseFeePerGas, maxPriorityFeePerGas }) => {
        const currentValue =
          value.maxPriorityFeePerGas ||
          (persistentValue?.maxPriorityFeePerGas ?? maxPriorityFeePerGas)

        return (
          <EvmFeeSettingsForm
            value={{
              ...value,
              maxPriorityFeePerGas: currentValue,
            }}
            onChange={setValue}
            onFinish={handleSave}
            onClose={onClose}
            chain={chain}
            baseFeePerGas={baseFeePerGas}
          />
        )
      }}
      pending={() => (
        <PendingQueryOverlay
          onClose={onClose}
          title={<StrictText>{t('loading')}</StrictText>}
        />
      )}
      error={() => (
        <FailedQueryOverlay
          title={<StrictText>{t('failed_to_load')}</StrictText>}
          onClose={onClose}
          closeText={t('close')}
        />
      )}
    />
  )
}
