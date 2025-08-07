import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import BookAIcon from '@lib/ui/icons/BookAIcon'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
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

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { AnimatedSendFormInputError } from '../../components/AnimatedSendFormInputError'
import { validateSendForm } from '../../form/validateSendForm'
import { useCurrentSendCoin } from '../../state/sendCoin'
import { AddressBookModal } from './AddressBookModal'

type MangeReceiverViewState = 'default' | 'addressBook' | 'scanner'

export const ManageReceiverAddressInputField = () => {
  const { t } = useTranslation()
  const address = useSender()
  const coin = useCurrentSendCoin()
  const { getClipboardText } = useCore()
  const { name } = useCurrentVault()
  const [value, setValue] = useSendReceiver()
  const [viewState, setViewState] = useState<MangeReceiverViewState>('default')
  const walletCore = useAssertWalletCore()

  const [
    {
      errors: { receiverAddress: addressError },
    },
    setFocusedSendField,
  ] = useSendFormFieldState()

  const error = !!addressError && value ? addressError : undefined

  const handleUpdateReceiverAddress = useCallback(
    (value: string) => {
      setValue(value)
      const validation = validateSendForm(
        {
          coin,
          amount: 0n,
          senderAddress: coin.address,
          receiverAddress: value,
        },
        {
          balance: undefined,
          walletCore,
          t,
        }
      )
      setFocusedSendField(state => ({
        ...state,
        errors: validation,
        field: validation.receiverAddress ? state.field : 'amount',
      }))
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
                />
                {error && <AnimatedSendFormInputError error={error} />}
              </VStack>

              <HStack justifyContent="space-between" gap={8}>
                <StyledIconButton
                  onClick={async () => {
                    const { data } = await attempt(getClipboardText)

                    if (data) {
                      handleUpdateReceiverAddress(data)
                    }
                  }}
                >
                  <PasteIcon />
                </StyledIconButton>
                <StyledIconButton onClick={() => setViewState('scanner')}>
                  <CameraIcon />
                </StyledIconButton>
                <StyledIconButton onClick={() => setViewState('addressBook')}>
                  <BookAIcon />
                </StyledIconButton>
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

const StyledIconButton = styled(IconButton)`
  padding: 12px 16px;
  width: 103px;
  height: 46px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.s}

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
