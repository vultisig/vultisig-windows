import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import {
  defaultFeePriority,
  feePriorities,
  FeePriority,
} from '@core/chain/tx/fee/FeePriority'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { HorizontalLine } from '../../../components/HorizontalLine'
import { useFeeSettings } from '../state/feeSettings'
import { BaseFee } from './baseFee/BaseFee'

type FeeSettingsFormShape = {
  priority: FeePriority
  gasLimit: number | null
}

export const ManageEvmFeeSettings: React.FC<OnCloseProp> = ({ onClose }) => {
  const { t } = useTranslation()

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
        priority: defaultFeePriority,
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
      title={t('advanced')}
      footer={<Button htmlType="submit" kind="primary" label={t('save')} />}
    >
      <VStack gap={12}>
        <LineWrapper>
          <HorizontalLine />
        </LineWrapper>
        <InputContainer>
          <Text size={14} color="supporting">
            {t('priority')}
          </Text>
          <RadioInput
            options={feePriorities}
            value={value.priority}
            onChange={priority => setValue({ ...value, priority })}
            renderOption={t}
          />
        </InputContainer>
        <BaseFee />
        <AmountTextInput
          labelPosition="left"
          label={
            <Text size={14} color="supporting">
              {t('gas_limit')}
            </Text>
          }
          value={value.gasLimit}
          onValueChange={gasLimit => setValue({ ...value, gasLimit })}
        />
      </VStack>
    </Modal>
  )
}

const StyledButton = styled(Button)`
  background-color: ${getColor('buttonPrimaryWeb')};
`

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`
