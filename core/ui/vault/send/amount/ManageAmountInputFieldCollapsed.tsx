import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SendInputContainer } from '../components/SendInputContainer'
import { useSendAmount } from '../state/amount'
import { useSendFormFieldState } from '../state/formFields'

export const ManageAmountInputFieldCollapsed = () => {
  const { t } = useTranslation()
  const [amount] = useSendAmount()
  const [
    {
      field,
      fieldsChecked: { amount: isAmountFieldChecked },
    },
    setFocusedSendField,
  ] = useSendFormFieldState()

  const isOpen = field === 'address'

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
      <HStack gap={12}>
        {isAmountFieldChecked && (
          <IconWrapper>
            <CheckmarkIcon />
          </IconWrapper>
        )}
        {!isOpen && (
          <PencilIconWrapper>
            <PencilIcon />
          </PencilIconWrapper>
        )}
      </HStack>
    </CollapsedCoinInputContainer>
  )
}

const CollapsedCoinInputContainer = styled(SendInputContainer)`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`

const IconWrapper = styled.div`
  font-size: 16px;
  color: ${getColor('success')};
  line-height: 0;
  border-radius: 99px;
  border: 1px solid ${getColor('success')};
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
  font-size: 16px;
`
