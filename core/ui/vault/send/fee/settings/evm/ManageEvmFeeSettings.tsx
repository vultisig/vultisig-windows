import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useEvmDefaultPriorityFeeQuery } from '@core/chain/tx/fee/evm/hooks/useEvmDefaultPriorityFeeQuery'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { BaseFee } from '@core/ui/vault/send/fee/settings/evm/baseFee/BaseFee'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentSendCoin } from '../../../state/sendCoin'

type FeeSettingsFormShape = {
  priorityFee: number
  gasLimit: number | null
}

export const ManageEvmFeeSettings: FC<OnCloseProp> = ({ onClose }) => {
  const { t } = useTranslation()

  const [
    {
      coin: { chain },
    },
  ] = useCurrentSendCoin()

  const { data: defaultFeePriority = 0, isSuccess } =
    useEvmDefaultPriorityFeeQuery({
      chain: chain as EvmChain,
    })

  const [persistentValue, setPersistentValue] = useFeeSettings<EvmFeeSettings>()

  const sendChainSpecific = useSendChainSpecific()
  const { gasLimit: defaultGasLimit } = getDiscriminatedUnionValue(
    sendChainSpecific,
    'case',
    'value',
    'ethereumSpecific'
  )

  const [value, setValue] = useState<FeeSettingsFormShape>(
    () =>
      persistentValue ?? {
        priorityFee: defaultFeePriority,
        gasLimit: Number(defaultGasLimit),
      }
  )

  const guardedValue: EvmFeeSettings = useMemo(
    () => ({
      ...value,
      gasLimit: value.gasLimit ?? 0,
    }),
    [value]
  )

  useEffect(() => {
    if (isSuccess && persistentValue?.priorityFee == null) {
      setValue(prev => ({ ...prev, priorityFee: defaultFeePriority }))
    }
  }, [defaultFeePriority, isSuccess, persistentValue?.priorityFee])

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: () => {
          setPersistentValue(guardedValue)
          onClose()
        },
        onClose,
      })}
      onClose={onClose}
      title={t('advanced_gas_fee')}
      footer={<Button type="submit">{t('save')}</Button>}
    >
      <VStack gap={12}>
        <LineWrapper>
          <HorizontalLine />
        </LineWrapper>
        <AmountTextInput
          labelPosition="left"
          label={
            <Tooltip
              content={<Text>{t('priority_fee_tooltip_content')}</Text>}
              renderOpener={props => {
                return (
                  <Text size={14} color="supporting" {...props}>
                    {t('priority_fee')} ({t('gwei')})
                  </Text>
                )
              }}
            />
          }
          value={value.priorityFee}
          onValueChange={priorityFee =>
            setValue({ ...value, priorityFee: priorityFee ?? 0 })
          }
        />
        <BaseFee />
        <AmountTextInput
          labelPosition="left"
          label={
            <Tooltip
              content={<Text>{t('gas_limit_tooltip_content')}</Text>}
              renderOpener={props => {
                return (
                  <Text size={14} color="supporting" {...props}>
                    {t('gas_limit')}
                  </Text>
                )
              }}
            />
          }
          value={value.gasLimit}
          onValueChange={gasLimit => setValue({ ...value, gasLimit })}
        />
      </VStack>
    </Modal>
  )
}

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`
