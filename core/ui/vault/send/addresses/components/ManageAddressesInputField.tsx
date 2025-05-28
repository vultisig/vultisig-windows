import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { IconButton, iconButtonSizeRecord } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { textInputHorizontalPadding } from '@lib/ui/css/textInput'
import { textInputHeight } from '@lib/ui/css/textInput'
import AddressBookIcon from '@lib/ui/icons/AddressBookIcon'
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

import { AddressBookListItem } from '../../../../address-book/item'
import { ScanQrView } from '../../../../qr/components/ScanQrView'
import { useCore } from '../../../../state/core'
import { useAddressBookItems } from '../../../../storage/addressBook'
import { useCurrentVault } from '../../../state/currentVault'
import { HorizontalLine } from '../../components/HorizontalLine'
import { SendInputContainer } from '../../components/SendInputContainer'
import { useFocusedSendField } from '../../providers/FocusedSendFieldProvider'
import { useSender } from '../../sender/hooks/useSender'
import { useSendReceiver } from '../../state/receiver'

type MangeReceiverViewState = 'default' | 'addressBook' | 'scanner'

export const ManageReceiverAddressInputField = () => {
  const { t } = useTranslation()
  const address = useSender()

  const { getClipboardText } = useCore()
  const { name } = useCurrentVault()
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const addressBookItems = useAddressBookItems()

  const [, setFocusedSendField] = useFocusedSendField()

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
        <Text color="shy">{t('to')}</Text>
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
            <ActionInsideInteractiveElement
              render={({ actionSize }) => (
                <Input
                  placeholder={t('enter_address')}
                  value={value}
                  onValueChange={value => handleUpdateReceiverAddress(value)}
                  style={{
                    paddingRight: actionSize.width + textInputHorizontalPadding,
                  }}
                />
              )}
              action={
                <HStack gap={8}>
                  <IconButton
                    icon={<PasteIcon />}
                    onClick={async () => {
                      const { data } = await attempt(getClipboardText)

                      if (data) {
                        handleUpdateReceiverAddress(data)
                      }
                    }}
                  />
                  <IconButton
                    icon={<CameraIcon fontSize={20} />}
                    onClick={() => setViewState('scanner')}
                  />
                  <IconButton
                    style={{
                      fontSize: 20,
                    }}
                    icon={<AddressBookIcon />}
                    onClick={() => setViewState('addressBook')}
                  />
                </HStack>
              }
              actionPlacerStyles={{
                right: textInputHorizontalPadding,
                bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
              }}
            />
          )}
        />
      </VStack>
    </SendInputContainer>
  )
}

const AddressFieldWrapper = styled(VStack)`
  background-color: ${getColor('foregroundDark')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 16px;
  ${borderRadius.m}
`

const Input = styled(TextInput)`
  background: transparent;
  background-color: ${getColor('foregroundDark')};
  background-color: ${getColor('foregroundDark')};
  border: 1px solid ${getColor('foregroundExtra')};
  &:hover,
  &:focus {
    outline: none;
    border: none;
  }
  border: none;
`

const FixedScanQRView = styled(ScanQrView)`
  position: fixed;
  inset: 0;
`
