import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
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
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const { ticker } = chainFeeCoin[coinKey.chain]
  const priorityFeeInGwei = fromChainAmount(
    BigInt(value.priorityFee),
    gwei.decimals
  )

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
            {t('current_base_fee')} ({ticker})
          </Text>
          <FeeContainer>{formatTokenAmount(baseFee)}</FeeContainer>
        </InputContainer>
        <InputContainer>
          <Text size={14} color="supporting">
            {t('priority_fee')} ({t('gwei')})
          </Text>
          <AmountTextInput
            value={priorityFeeInGwei}
            onValueChange={priorityFee =>
              onChange({
                ...value,
                priorityFee: priorityFee
                  ? Number(BigInt(Math.floor(priorityFee * 1e9)))
                  : 0,
              })
            }
          />
        </InputContainer>
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
