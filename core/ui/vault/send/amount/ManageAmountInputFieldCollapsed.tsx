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
import { useCurrentSendCoin } from '../state/sendCoin'

export const ManageAmountInputFieldCollapsed = () => {
  const { t } = useTranslation()
  const [amount] = useSendAmount()
  const coin = useCurrentSendCoin()
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
          fieldsChecked: {
            ...state.fieldsChecked,
            coin: !!coin,
          },
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
        {isAmountFieldChecked && <CheckmarkIcon />}
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
