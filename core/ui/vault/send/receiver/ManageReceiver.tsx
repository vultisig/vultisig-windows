import { AddressBookListItem } from '@core/ui/address-book/item'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { IconButton, iconButtonSizeRecord } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { BookMarkedIcon } from '@lib/ui/icons/BookMarkedIcon'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { ClipboardPasteIcon } from '@lib/ui/icons/ClipboardPasteIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Modal } from '@lib/ui/modal'
import { text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    weight: 400,
  })}
`

const FixedScanQRView = styled(ScanQrView)`
  position: fixed;
  inset: 0;
`

type MangeReceiverViewState = 'default' | 'addressBook' | 'scanner'

export const ManageReceiver = () => {
  const { t } = useTranslation()
  const { getClipboardText } = useCore()
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const addressBookItems = useAddressBookItems()

  const onScanSuccess = useCallback(
    (address: string) => {
      setValue(address)
      setViewState('default')
    },
    [setValue]
  )

  return (
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
                  setValue(address)
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
              label={t('to')}
              placeholder={t('enter_address')}
              value={value}
              onValueChange={setValue}
              style={{
                paddingRight: actionSize.width + textInputHorizontalPadding,
              }}
            />
          )}
          action={
            <HStack gap={8}>
              <IconButton
                icon={<ClipboardPasteIcon />}
                onClick={async () => {
                  const { data } = await attempt(getClipboardText)

                  if (data) {
                    setValue(data)
                  }
                }}
              />
              <IconButton
                icon={<CameraIcon fontSize={20} />}
                onClick={() => setViewState('scanner')}
              />
              <IconButton
                icon={<BookMarkedIcon />}
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
  )
}
