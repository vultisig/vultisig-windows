import { feePriorities } from '@core/chain/tx/fee/FeePriority'
import {
  byteFeeMultiplier,
  UtxoFeeSettings,
} from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { InputProps, OnCloseProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type UtxoFeeSettingsFormProps = InputProps<UtxoFeeSettings> &
  OnCloseProp &
  OnFinishProp & {
    byteFee: bigint
  }

export const UtxoFeeSettingsForm: React.FC<UtxoFeeSettingsFormProps> = ({
  value,
  onChange,
  onFinish,
  onClose,
  byteFee,
}) => {
  const { t } = useTranslation()

  const isDisabled = useMemo(() => {
    if (!value) {
      return t('network_rate_required')
    }
  }, [t, value])

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: onFinish,
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
            value={value && 'priority' in value ? value.priority : null}
            onChange={priority => onChange({ priority })}
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
          value={matchRecordUnion(value, {
            byteFee: value => Number(value),
            priority: priority =>
              Math.round(byteFeeMultiplier[priority] * Number(byteFee)),
          })}
          onValueChange={n => onChange({ byteFee: BigInt(n || 0) })}
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
