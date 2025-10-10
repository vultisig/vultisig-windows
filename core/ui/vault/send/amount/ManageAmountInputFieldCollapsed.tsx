import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SendFormIconsWrapper } from '../addresses/components/SendFormIconsWrapper'
import { SendInputContainer } from '../components/SendInputContainer'
import { useSendValidationQuery } from '../queries/useSendValidationQuery'
import { useSendAmount } from '../state/amount'
import { useSendFormFieldState } from '../state/formFields'
import { useCurrentSendCoin } from '../state/sendCoin'

export const ManageAmountInputFieldCollapsed = () => {
  const { t } = useTranslation()
  const [amount] = useSendAmount()
  const [{ field }, setFocusedSendField] = useSendFormFieldState()

  const { data } = useSendValidationQuery()
  const amountError = data?.amount

  const coin = useCurrentSendCoin()

  const isOpen = field === 'amount'
  const isChecked = amount !== null && amount > 0n && !isOpen && !amountError
  return (
    <CollapsedCoinInputContainer
      onClick={() => {
        setFocusedSendField(state => ({
          ...state,
          field: 'amount',
        }))
      }}
    >
      <HStack gap={12} alignItems="center">
        <Text size={14}>{t('amount')}</Text>
        <Text size={12} color="shy">
          {amount === null ? null : fromChainAmount(amount, coin.decimals)}
        </Text>
      </HStack>
      <SendFormIconsWrapper gap={12}>
        {isChecked && <CheckmarkIcon />}
        {!isOpen && (
          <PencilIconWrapper>
            <PencilIcon />
          </PencilIconWrapper>
        )}
      </SendFormIconsWrapper>
    </CollapsedCoinInputContainer>
  )
}

const CollapsedCoinInputContainer = styled(SendInputContainer)`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
`
