import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { InputProps, OnCloseProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FeeContainer } from '../FeeContainer'

export type EvmFeeSettingsFormValue = {
  priorityFee: number
  gasLimit: number
}

type EvmFeeSettingsFormProps = InputProps<EvmFeeSettingsFormValue> &
  OnCloseProp &
  OnFinishProp & {
    baseFee: number
  }

export const EvmFeeSettingsForm: FC<EvmFeeSettingsFormProps> = ({
  value,
  onChange,
  onFinish,
  onClose,
  baseFee,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: onFinish,
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
        <InputContainer>
          <Text size={14} color="supporting">
            {t('current_base_fee')}
          </Text>
          <FeeContainer>
            {formatTokenAmount(
              fromChainAmount(BigInt(Math.floor(baseFee * 1e9)), gwei.decimals)
            )}
          </FeeContainer>
        </InputContainer>
        <AmountTextInput
          labelPosition="left"
          label={
            <Tooltip
              content={<Text>{t('priority_fee_tooltip_content')}</Text>}
              renderOpener={props => (
                <Text size={14} color="supporting" {...props}>
                  {t('priority_fee')}
                </Text>
              )}
            />
          }
          value={value.priorityFee}
          onValueChange={priorityFee =>
            onChange({ ...value, priorityFee: priorityFee ?? 0 })
          }
        />
        <AmountTextInput
          labelPosition="left"
          label={
            <Tooltip
              content={<Text>{t('gas_limit_tooltip_content')}</Text>}
              renderOpener={props => (
                <Text size={14} color="supporting" {...props}>
                  {t('gas_limit')}
                </Text>
              )}
            />
          }
          value={value.gasLimit}
          onValueChange={gasLimit =>
            onChange({
              ...value,
              gasLimit:
                gasLimit ??
                getEvmGasLimit({
                  chain: EvmChain.Ethereum,
                  isNativeToken: true,
                }),
            })
          }
        />
      </VStack>
    </Modal>
  )
}

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`
