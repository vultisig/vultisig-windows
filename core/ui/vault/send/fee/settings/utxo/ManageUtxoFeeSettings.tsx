import { UtxoChain } from '@core/chain/Chain'
import {
  defaultFeePriority,
  feePriorities,
} from '@core/chain/tx/fee/FeePriority'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useUtxoByteFeeQuery } from '../../../../../chain/utxo/queries/byteFee'
import { useCurrentSendCoin } from '../../../state/sendCoin'

export const ManageUtxoFeeSettings: React.FC<OnCloseProp> = ({ onClose }) => {
  const { t } = useTranslation()
  const { chain } = useCurrentSendCoin()

  const [persistentValue, setPersistentValue] =
    useFeeSettings<UtxoFeeSettings>()

  const byteFeeQuery = useUtxoByteFeeQuery(chain as UtxoChain)

  const [value, setValue] = useState<UtxoFeeSettings>(
    () => persistentValue ?? { priority: defaultFeePriority }
  )

  const isDisabled = useMemo(() => {
    if (!value) {
      return t('network_rate_required')
    }
  }, [t, value])

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: () => {
          setPersistentValue(value)
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
            value={value && 'priority' in value ? value.priority : null}
            onChange={priority => setValue({ priority })}
            renderOption={t}
          />
        </InputContainer>
        <MatchQuery
          value={byteFeeQuery}
          pending={() => <Spinner />}
          success={byteFee => {
            const inputValue = Number(
              'byteFee' in value ? value.byteFee : byteFee
            )
            return (
              <AmountTextInput
                labelPosition="left"
                label={
                  <Text size={14} color="supporting">
                    {t('network_rate')} (sats/vbyte)
                  </Text>
                }
                value={inputValue || null}
                onValueChange={n => setValue({ byteFee: BigInt(n || 0) })}
                shouldBeInteger
                shouldBePositive
              />
            )
          }}
        />
      </VStack>
    </Modal>
  )
}

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`
