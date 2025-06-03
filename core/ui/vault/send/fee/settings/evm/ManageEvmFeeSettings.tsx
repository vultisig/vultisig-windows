import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useEvmDefaultPriorityFeeQuery } from '@core/chain/tx/fee/evm/hooks/useEvmDefaultPriorityFeeQuery'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { HorizontalLine } from '../../../components/HorizontalLine'
import { useFeeSettings } from '../state/feeSettings'
import { BaseFee } from './baseFee/BaseFee'

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
  ] = useCoreViewState<'send'>()

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
      footer={
        <StyledButton kind="accent" type="submit">
          {t('save')}
        </StyledButton>
      }
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

const StyledButton = styled(Button)`
  background-color: ${getColor('buttonPrimary')};
`

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`
