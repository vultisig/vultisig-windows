import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
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
import { BookIcon } from '@lib/ui/icons/BookIcon'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { SquareBehindSquare4Icon } from '@lib/ui/icons/SquareBehindSquare4Icon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
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
  const coin = useCurrentSendCoin()
  const { getClipboardText } = useCore()
  const { name } = useCurrentVault()
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const [touched, setTouched] = useState(false)
  const walletCore = useAssertWalletCore()

  const { data } = useSendValidationQuery()

  const [, setFocusedSendField] = useSendFormFieldState()

  const error = touched ? data?.receiverAddress : undefined

  const handleUpdateReceiverAddress = useCallback(
    (value: string) => {
      setTouched(true)
      setValue(value)
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
            <AddressBookModal
              onClose={() => setViewState('default')}
              onSelect={address => {
                handleUpdateReceiverAddress(address)
                setViewState('default')
              }}
            />
          )}
          default={() => (
            <VStack gap={8}>
              <VStack gap={4}>
                <Input
                  validation={error ? 'warning' : undefined}
                  placeholder={t('enter_address')}
                  value={value}
                  onValueChange={value => handleUpdateReceiverAddress(value)}
                  onBlur={() => setTouched(true)}
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
                  <SquareBehindSquare4Icon />
                </ActionIconButton>
                <ActionIconButton onClick={() => setViewState('scanner')}>
                  <CameraIcon />
                </ActionIconButton>
                <ActionIconButton onClick={() => setViewState('addressBook')}>
                  <BookIcon />
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
        ? getColor('idle')
        : getColor('foregroundExtra')};
`

const FixedScanQRView = styled(ScanQrView)`
  position: fixed;
  inset: 0;
`
