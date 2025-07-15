import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SendFormIconsWrapper } from '../addresses/components/SendFormIconsWrapper'
import { SendInputContainer } from '../components/SendInputContainer'
import { useSendAmount } from '../state/amount'
import { useSendFormFieldState } from '../state/formFields'

export const ManageAmountInputFieldCollapsed = () => {
  const { t } = useTranslation()
  const [amount] = useSendAmount()
  const [
    {
      field,
      errors: { amount: amountError },
    },
    setFocusedSendField,
  ] = useSendFormFieldState()

  const isOpen = field === 'amount'
  const isChecked = Boolean(amount) && !isOpen && !amountError
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
          {amount}
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
