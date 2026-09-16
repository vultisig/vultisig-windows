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
      data-testid="send-address-field"
      onClick={() => {
        setFocusedSendField(state => ({
          ...state,
          field: 'address',
        }))
      }}
    >
      <AddressRow gap={12} alignItems="center">
        <Text nowrap size={14}>
          {t('address')}
        </Text>
        <AddressText size={12} color="shy">
          <MiddleTruncate text={address} />
        </AddressText>
      </AddressRow>
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

/**
 * Holds the label and the address. It takes the width the field leaves after
 * the icons instead of its content's, or a fixed-width address pushes the
 * check and pencil icons out of the field at the popup width.
 */
const AddressRow = styled(HStack)`
  flex: 1;
  min-width: 0;
`

// `MiddleTruncate` truncates against the width it is given, so this has to be
// sized by the row rather than by the address, capped where the design puts it.
const AddressText = styled(Text)`
  flex: 1;
  min-width: 0;
  max-width: 250px;
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
`
