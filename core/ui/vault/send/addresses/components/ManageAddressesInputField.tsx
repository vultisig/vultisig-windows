import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { UploadQrView } from '@core/ui/qr/components/UploadQrView'
import { useCore } from '@core/ui/state/core'
import { ActionIconButton } from '@core/ui/vault/components/action-form/ActionIconButton'
import { AddressBookModal } from '@core/ui/vault/send/addresses/components/AddressBookModal'
import { AnimatedSendFormInputError } from '@core/ui/vault/send/components/AnimatedSendFormInputError'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { validateSendReceiver } from '@core/ui/vault/send/form/validateSendForm'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { BookBookmarkFilledIcon } from '@lib/ui/icons/BookBookmarkFilledIcon'
import { CameraFilledIcon } from '@lib/ui/icons/CameraFilledIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type MangeReceiverViewState = 'default' | 'addressBook' | 'scanner'

/**
 * The open receiver field. Takes an address, or a `.eth`, `.thor` or `.maya`
 * name (the suffix optional on Ethereum, THORChain and MayaChain), typed,
 * pasted, scanned or picked from the address book. A name is replaced by its address
 * once it resolves; see `SendReceiverResolutionProvider`.
 */
export const ManageReceiverAddressInputField = () => {
  const { t } = useTranslation()
  const address = useSender()
  const coin = useCurrentSendCoin()
  const { getClipboardText } = useCore()
  const { name } = useCurrentVault()
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const [qrView, setQrView] = useState<'scan' | 'upload'>('scan')
  const [touched, setTouched] = useState(false)
  const walletCore = useAssertWalletCore()

  const { data } = useSendValidationQuery()

  const [, setFocusedSendField] = useSendFormFieldState()

  const error = touched ? data?.receiverAddress : undefined

  const handleUpdateReceiverAddress = useCallback(
    (value: string) => {
      setTouched(true)
      setValue(value)
      // A valid address moves on to the amount right away; a name does once
      // it resolves.
      const receiverError = validateSendReceiver({
        receiverAddress: value,
        chain: coin.chain,
        senderAddress: coin.address,
        walletCore,
        t,
      })
      if (!receiverError) {
        setFocusedSendField(state => ({
          ...state,
          field: 'amount',
        }))
      }
    },
    [coin, setValue, setFocusedSendField, walletCore, t]
  )

  const closeQrModal = useCallback(() => {
    setQrView('scan')
    setViewState('default')
  }, [])

  const onScanSuccess = useCallback(
    (address: string) => {
      handleUpdateReceiverAddress(address)
      closeQrModal()
    },
    [closeQrModal, handleUpdateReceiverAddress]
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
            <Modal title="" onClose={closeQrModal} withDefaultStructure={false}>
              <QrModalOverlay>
                <PageHeader
                  hasBorder
                  title={
                    qrView === 'upload'
                      ? t('upload_qr_code_image')
                      : t('scan_qr')
                  }
                  primaryControls={
                    <PageHeaderBackButton
                      onClick={
                        qrView === 'upload'
                          ? () => setQrView('scan')
                          : closeQrModal
                      }
                    />
                  }
                />
                <QrModalBody>
                  <Match
                    value={qrView}
                    scan={() => (
                      <ScanQrView
                        onFinish={onScanSuccess}
                        onUploadQrViewRequest={() => setQrView('upload')}
                      />
                    )}
                    upload={() => (
                      <UploadQrView
                        title={t('upload_qr_code_with_address')}
                        onFinish={onScanSuccess}
                      />
                    )}
                  />
                </QrModalBody>
              </QrModalOverlay>
            </Modal>
          )}
          addressBook={() => (
            <AddressBookModal
              onClose={() => setViewState('default')}
              onSelect={selectedAddress => {
                handleUpdateReceiverAddress(selectedAddress)
                setViewState('default')
              }}
            />
          )}
          default={() => (
            <VStack gap={8}>
              <VStack gap={4}>
                <Input
                  validation={error ? 'warning' : undefined}
                  placeholder={t('enter_address_here')}
                  value={value}
                  onValueChange={newValue =>
                    handleUpdateReceiverAddress(newValue)
                  }
                  onBlur={() => setTouched(true)}
                  data-testid="send-address-input"
                />
                {error && <AnimatedSendFormInputError error={error} />}
              </VStack>

              <HStack justifyContent="space-between" gap={8}>
                <ActionIconButton
                  onClick={async () => {
                    const { data } = await attempt(getClipboardText)

                    if (data) {
                      handleUpdateReceiverAddress(data)
                    }
                  }}
                >
                  <CopyIcon />
                </ActionIconButton>
                <ActionIconButton
                  onClick={() => {
                    setQrView('scan')
                    setViewState('scanner')
                  }}
                >
                  <CameraFilledIcon />
                </ActionIconButton>
                <ActionIconButton onClick={() => setViewState('addressBook')}>
                  <BookBookmarkFilledIcon />
                </ActionIconButton>
              </HStack>
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
  ${borderRadius.md}
`

const Input = styled(TextInput)<{
  validation?: 'warning' | undefined
}>`
  background: transparent;
  background-color: ${getColor('foreground')};
  border: 1px solid
    ${({ validation }) =>
      validation === 'warning'
        ? getColor('idle')
        : getColor('foregroundExtra')};
`

const QrModalOverlay = styled(VStack).attrs({
  fullHeight: true,
  fullWidth: true,
})`
  position: fixed;
  inset: 0;
  background: ${getColor('background')};
  isolation: isolate;
`

const QrModalBody = styled(VStack)`
  flex: 1;
  min-height: 0;
`
