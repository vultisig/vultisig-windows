import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { InputProps, OnCloseProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useEvmBaseFeeQuery } from '../../../../../chain/evm/queries/baseFee'
import { FeeContainer } from '../FeeContainer'

type EvmFeeSettingsFormProps = InputProps<EvmFeeSettings> &
  OnCloseProp &
  OnFinishProp & {
    chain: EvmChain
  }

export const EvmFeeSettingsForm: FC<EvmFeeSettingsFormProps> = ({
  value,
  onChange,
  onFinish,
  onClose,
  chain,
}) => {
  const { t } = useTranslation()
  const { ticker, decimals } = chainFeeCoin[chain]
  const priorityFeeInGwei = fromChainAmount(
    BigInt(value.priorityFee),
    gwei.decimals
  )

  const baseFeeQuery = useEvmBaseFeeQuery(chain)

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
            {t('base_fee')} ({ticker})
          </Text>
          <FeeContainer>
            <MatchQuery
              value={baseFeeQuery}
              success={baseFee =>
                formatTokenAmount(fromChainAmount(baseFee, decimals))
              }
              pending={() => <Spinner />}
              error={() => t('failed_to_load')}
            />
          </FeeContainer>
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
                  ? toChainAmount(priorityFee, gwei.decimals)
                  : 0n,
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
          value={Number(value.gasLimit)}
          onValueChange={gasLimit =>
            onChange({
              ...value,
              gasLimit: gasLimit ? BigInt(gasLimit) : 0n,
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
