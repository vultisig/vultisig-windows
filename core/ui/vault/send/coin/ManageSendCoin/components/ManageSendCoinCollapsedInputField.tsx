import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../../../chain/coin/icon/CoinIcon'
import { SendFormIconsWrapper } from '../../../addresses/components/SendFormIconsWrapper'
import { SendInputContainer } from '../../../components/SendInputContainer'
import { useSendValidationQuery } from '../../../queries/useSendValidationQuery'
import { useSendFormFieldState } from '../../../state/formFields'
import { useCurrentSendCoin } from '../../../state/sendCoin'

export const ManageSendCoinCollapsedInputField = () => {
  const coin = useCurrentSendCoin()
  const { ticker } = coin
  const { t } = useTranslation()
  const [{ field }, setFocusedSendField] = useSendFormFieldState()

  const { data } = useSendValidationQuery()
  const coinError = data?.coin

  const isOpen = field === 'coin'
  const isChecked = coin && !isOpen && !coinError

  return (
    <CollapsedCoinInputContainer
      onClick={() => {
        setFocusedSendField(state => ({
          ...state,
          field: 'coin',
        }))
      }}
    >
      <HStack gap={12} alignItems="center">
        <Text size={14}>{t('asset')}</Text>
        <HStack gap={4} alignItems="center">
          <CoinIcon coin={coin} style={{ fontSize: 20 }} />
          <Text size={12} color="shy">
            {ticker}
          </Text>
        </HStack>
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
