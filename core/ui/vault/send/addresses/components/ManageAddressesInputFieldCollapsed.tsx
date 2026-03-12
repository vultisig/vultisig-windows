import {
  ActionFormCheckBadge,
  ActionFormIconsWrapper,
} from '@core/ui/vault/components/action-form/ActionFormIconsWrapper'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ManageAddressesInputFieldCollapsed = () => {
  const { t } = useTranslation()
  const [address] = useSendReceiver()

  const [{ field }, setFocusedSendField] = useSendFormFieldState()

  const { data } = useSendValidationQuery()
  const addressError = data?.receiverAddress

  const isOpen = field === 'address'
  const isChecked = address && !isOpen && !addressError

  return (
    <CollapsedCoinInputContainer
      onClick={() => {
        setFocusedSendField(state => ({
          ...state,
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
      <ActionFormIconsWrapper gap={12}>
        {isChecked && (
          <>
            <ActionFormCheckBadge>
              <CheckmarkIcon />
            </ActionFormCheckBadge>
            {!isOpen && (
              <PencilIconWrapper>
                <PencilIcon />
              </PencilIconWrapper>
            )}
          </>
        )}
      </ActionFormIconsWrapper>
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
