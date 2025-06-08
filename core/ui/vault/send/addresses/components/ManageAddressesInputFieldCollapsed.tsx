import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SendInputContainer } from '../../components/SendInputContainer'
import { useSendFormFieldState } from '../../state/formFields'
import { useSendReceiver } from '../../state/receiver'
import { useCurrentSendCoin } from '../../state/sendCoin'
import { SendFormIconsWrapper } from './SendFormIconsWrapper'

export const ManageAddressesInputFieldCollapsed = () => {
  const { t } = useTranslation()
  const [address] = useSendReceiver()
  const [{ coin }] = useCurrentSendCoin()

  const [
    {
      field,
      fieldsChecked: { address: isAddressFieldChecked },
      errors: { address: addressError },
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
          field: 'address',
        }))
      }}
    >
      <HStack gap={12} alignItems="center">
        <Text cropped size={14}>
          {t('address')}
        </Text>
        <Text cropped size={12} color="shy">
          <MiddleTruncate text={address} width={250} />
        </Text>
      </HStack>
      <SendFormIconsWrapper gap={12}>
        {!addressError && isAddressFieldChecked && <CheckmarkIcon />}
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
