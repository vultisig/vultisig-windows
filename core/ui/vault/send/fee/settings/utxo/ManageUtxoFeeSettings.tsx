import {
  defaultFeePriority,
  feePriorities,
  FeePriority,
} from '@core/chain/tx/fee/FeePriority'
import { adjustByteFee } from '@core/chain/tx/fee/utxo/adjustByteFee'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type FormShape = {
  priority: FeePriority | number | null
}

export const ManageUtxoFeeSettings: React.FC<OnCloseProp> = ({ onClose }) => {
  const { t } = useTranslation()

  const [persistentValue, setPersistentValue] =
    useFeeSettings<UtxoFeeSettings>()

  const chainSpecific = useSendChainSpecific()

  const { byteFee } = getDiscriminatedUnionValue(
    chainSpecific,
    'case',
    'value',
    'utxoSpecific'
  )

  const [value, setValue] = useState<FormShape>(
    () =>
      persistentValue ?? {
        priority: defaultFeePriority,
      }
  )

  const isDisabled = useMemo(() => {
    if (!value.priority) {
      return t('network_rate_required')
    }
  }, [t, value.priority])

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: () => {
          setPersistentValue({
            priority: shouldBePresent(value.priority),
          })
          onClose()
        },
        onClose,
        isDisabled,
      })}
      onClose={onClose}
      title={<Text size={17}>{t('advanced_gas_fee')}</Text>}
      footer={
        <Button disabled={isDisabled} type="submit">
          {t('save')}
        </Button>
      }
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
            value={typeof value.priority === 'number' ? null : value.priority}
            onChange={priority => setValue({ ...value, priority })}
            renderOption={t}
          />
        </InputContainer>
        <AmountTextInput
          labelPosition="left"
          label={
            <Text size={14} color="supporting">
              {t('network_rate')} (sats/vbyte)
            </Text>
          }
          value={
            value.priority
              ? adjustByteFee(Number(byteFee), { priority: value.priority })
              : null
          }
          onValueChange={priority => setValue({ ...value, priority })}
          shouldBeInteger
          shouldBePositive
        />
      </VStack>
    </Modal>
  )
}

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`
