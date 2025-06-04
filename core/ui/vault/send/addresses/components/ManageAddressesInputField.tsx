import { AddressBookListItem } from '@core/ui/address-book/item'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { iconButtonSizeRecord } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { textInputHorizontalPadding } from '@lib/ui/css/textInput'
import { textInputHeight } from '@lib/ui/css/textInput'
import BookAIcon from '@lib/ui/icons/BookAIcon'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type MangeReceiverViewState = 'default' | 'addressBook' | 'scanner'

export const ManageReceiverAddressInputField = () => {
  const { t } = useTranslation()
  const address = useSender()

  const { getClipboardText } = useCore()
  const { name } = useCurrentVault()
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const addressBookItems = useAddressBookItems()

  const [
    {
      errors: { address: addressError },
    },
    setFocusedSendField,
  ] = useSendFormFieldState()

  const error = !!addressError && value ? addressError : undefined

  const handleUpdateReceiverAddress = useCallback(
    (value: string) => {
      setValue(value)
      setFocusedSendField(state => ({
        ...state,
        fieldsChecked: {
          ...state.fieldsChecked,
          address: value ? true : false,
        },
      }))
    },
    [setFocusedSendField, setValue]
  )

  const onScanSuccess = useCallback(
    (address: string) => {
      handleUpdateReceiverAddress(address)
      setViewState('default')
    },
    [handleUpdateReceiverAddress]
  )

  return (
    <SendInputContainer>
      <InputLabel>{t('address')}</InputLabel>
      <HorizontalLine />
      <VStack gap={12}>
        <Text>{t('from')}</Text>
        <AddressFieldWrapper gap={2}>
          <Text size={14} color="shy">
            {name}
          </Text>
          <Text size={14}>{address}</Text>
        </AddressFieldWrapper>
      </VStack>
      <VStack gap={12}>
        <Text color="shy">{t('send_to')}</Text>
        <Match
          value={viewState}
          scanner={() => (
            <Modal
              title=""
              onClose={() => setViewState('default')}
              withDefaultStructure={false}
            >
              <FixedScanQRView onFinish={onScanSuccess} />
            </Modal>
          )}
          addressBook={() => (
            <Modal
              onClose={() => setViewState('default')}
              title={t('address_book')}
            >
              <List>
                {addressBookItems.map(item => (
                  <AddressBookListItem
                    key={item.id}
                    onSelect={address => {
                      handleUpdateReceiverAddress(address)
                      setViewState('default')
                    }}
                    {...item}
                  />
                ))}
              </List>
            </Modal>
          )}
          default={() => (
            <VStack gap={8}>
              <ActionInsideInteractiveElement
                render={({ actionSize }) => (
                  <VStack gap={4}>
                    <Input
                      validation={error ? 'warning' : undefined}
                      placeholder={t('enter_address')}
                      value={value}
                      onValueChange={value =>
                        handleUpdateReceiverAddress(value)
                      }
                      style={{
                        paddingRight:
                          actionSize.width + textInputHorizontalPadding,
                      }}
                    />
                  </VStack>
                )}
                action={
                  <HStack gap={8}>
                    <IconButton
                      onClick={async () => {
                        const { data } = await attempt(getClipboardText)

                        if (data) {
                          handleUpdateReceiverAddress(data)
                        }
                      }}
                    >
                      <PasteIcon />
                    </IconButton>
                    <IconButton onClick={() => setViewState('scanner')}>
                      <CameraIcon />
                    </IconButton>
                    <IconButton onClick={() => setViewState('addressBook')}>
                      <BookAIcon />
                    </IconButton>
                  </HStack>
                }
                actionPlacerStyles={{
                  right: textInputHorizontalPadding,
                  bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
                }}
              />
              {error && (
                <Text size={12} color="warning">
                  {error}
                </Text>
              )}
            </VStack>
          )}
        />
      </VStack>
    </SendInputContainer>
  )
}

const AddressFieldWrapper = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 16px;
  ${borderRadius.m}
`

const Input = styled(TextInput)<{
  validation?: 'warning' | undefined
}>`
  background: transparent;
  background-color: ${getColor('foreground')};
  border: 1px solid
    ${({ validation }) =>
      validation === 'warning'
        ? getColor('alertWarning')
        : getColor('foregroundExtra')};
`

const FixedScanQRView = styled(ScanQrView)`
  position: fixed;
  inset: 0;
`
