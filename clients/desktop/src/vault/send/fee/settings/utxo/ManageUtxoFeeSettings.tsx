import {
  defaultFeePriority,
  feePriorities,
  FeePriority,
} from '@core/chain/tx/fee/FeePriority'
import { adjustByteFee } from '@core/chain/tx/fee/utxo/adjustByteFee'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AmountTextInput } from '../../../../../lib/ui/inputs/AmountTextInput'
import { RadioInput } from '../../../../../lib/ui/inputs/RadioInput'
import { Modal } from '../../../../../lib/ui/modal'
import { useSendChainSpecific } from '../../SendChainSpecificProvider'
import { useFeeSettings } from '../state/feeSettings'

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
      title={t('advanced')}
      footer={
        <Button isDisabled={isDisabled} type="submit">
          {t('save')}
        </Button>
      }
    >
      <VStack gap={12}>
        <InputContainer>
          <InputLabel>{t('priority')}</InputLabel>
          <RadioInput
            options={feePriorities}
            value={typeof value.priority === 'number' ? null : value.priority}
            onChange={priority => setValue({ ...value, priority })}
            renderOption={t}
          />
        </InputContainer>
        <AmountTextInput
          label={<InputLabel>{t('network_rate')} (sats/vbyte)</InputLabel>}
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
