import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { IconButton, iconButtonSizeRecord } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import AddressBookIcon from '@lib/ui/icons/AddressBookIcon'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack } from '@lib/ui/layout/Stack'
import { text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ClipboardGetText } from '../../../../wailsjs/runtime/runtime'
import { Modal } from '../../../lib/ui/modal'
import { ScanQrView } from '../../qr/upload/ScanQrView'
import AddressSelector from '../addressSelector/AddressSelector'
import { useSendReceiver } from '../state/receiver'

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
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const { t } = useTranslation()

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
          <FixedScanQRView onScanSuccess={onScanSuccess} />
        </Modal>
      )}
      addressBook={() => (
        <Modal title="" withDefaultStructure={false}>
          <AddressSelector
            onAddressClick={address => {
              setValue(address)
              setViewState('default')
            }}
            onClose={() => setViewState('default')}
          />
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
                icon={<PasteIcon />}
                onClick={async () => {
                  const { data } = await attempt(ClipboardGetText)

                  if (data) {
                    setValue(data)
                  }
                }}
              />
              <IconButton
                icon={<CameraIcon size={20} />}
                onClick={() => setViewState('scanner')}
              />
              <IconButton
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
  )
}
