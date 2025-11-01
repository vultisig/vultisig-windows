import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { deriveEvmGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { useEvmMaxPriorityFeePerGasQuery } from '@core/ui/chain/evm/queries/maxPriorityFeePerGas'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { ControlledValue } from '@lib/ui/base/ControlledValue'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FailedQueryOverlay } from '@lib/ui/query/components/overlay/FailedQueryOverlay'
import { PendingQueryOverlay } from '@lib/ui/query/components/overlay/PendingQueryOverlay'
import { StrictText } from '@lib/ui/text'
import { FC } from 'react'
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

  const priorityFeeQuery = useEvmMaxPriorityFeePerGasQuery(chain)

  return (
    <MatchQuery
      value={priorityFeeQuery}
      success={maxPriorityFeePerGas => {
        const initialValue = persistentValue ?? {
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          gasLimit: deriveEvmGasLimit({
            coin: { chain },
          }),
        }

        return (
          <ControlledValue
            initialValue={initialValue}
            render={({ value, onChange }) => (
              <EvmFeeSettingsForm
                value={value}
                onChange={onChange}
                onFinish={() => {
                  setPersistentValue(value)
                  onClose()
                }}
                onClose={onClose}
                chain={chain}
              />
            )}
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
