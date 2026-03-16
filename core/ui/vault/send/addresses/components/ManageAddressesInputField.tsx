import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
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
import { useSendReceiverLabel } from '@core/ui/vault/send/state/receiverLabel'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { BookIcon } from '@lib/ui/icons/BookIcon'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { SquareBehindSquare4Icon } from '@lib/ui/icons/SquareBehindSquare4Icon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { getAddress } from 'viem'
import { getEnsAddress, normalize } from 'viem/ens'

type MangeReceiverViewState = 'default' | 'addressBook' | 'scanner'

export const ManageReceiverAddressInputField = () => {
  const { t } = useTranslation()
  const address = useSender()
  const coin = useCurrentSendCoin()
  const { getClipboardText } = useCore()
  const { name } = useCurrentVault()
  const [value, setValue] = useSendReceiver()
  const [, setReceiverLabel] = useSendReceiverLabel()
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
      // Clear the receiver label whenever the user provides a raw address directly
      // (label is set asynchronously by the name resolution effect below when applicable)
      if (!/^.+\.eth$/i.test(value.trim())) {
        setReceiverLabel('')
      }
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
    [coin, setValue, setReceiverLabel, setFocusedSendField, walletCore, t]
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

  // Debounced value used to trigger ENS resolution without firing on every keystroke
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    // Only attempt ENS resolution on Ethereum mainnet — two known limitations:
    // 1. Root .eth names only; ENSIP-11 multi-chain coin types not yet supported.
    // 2. Custom domains (e.g. fluidkey.id, cb.id) not yet supported; those use
    //    offchain resolvers (CCIP-Read / EIP-3668) and non-.eth TLDs.
    // Loop prevention: after resolution the receiver is set to a raw address
    // which won't match the .eth regex, so this effect is skipped on the re-fire.
    if (
      coin.chain !== EvmChain.Ethereum ||
      !/^.+\.eth$/i.test(debouncedValue.trim())
    )
      return

    // Clear stale label before attempting new resolution so a failed lookup
    // never leaves a ghost label from a previous successful one
    setReceiverLabel('')

    let cancelled = false

    attempt(async () => {
      const client = getEvmClient(EvmChain.Ethereum)
      const address = await getEnsAddress(client, {
        name: normalize(debouncedValue),
      })
      if (!address)
        throw new Error(`ENS name "${debouncedValue}" could not be resolved`)
      return getAddress(address)
    }).then(result => {
      if (cancelled) return
      if (!('error' in result) && result.data) {
        const resolved = result.data
        setReceiverLabel(debouncedValue)
        setValue(resolved)
        // Advance to amount field since address is now valid
        setFocusedSendField(state => ({ ...state, field: 'amount' }))
      }
      // On failure we simply leave the field as-is (invalid address shows error)
    })

    return () => {
      cancelled = true
    }
  }, [
    coin.chain,
    debouncedValue,
    setValue,
    setReceiverLabel,
    setFocusedSendField,
  ])

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
                  <SquareBehindSquare4Icon />
                </ActionIconButton>
                <ActionIconButton
                  onClick={() => {
                    setQrView('scan')
                    setViewState('scanner')
                  }}
                >
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
