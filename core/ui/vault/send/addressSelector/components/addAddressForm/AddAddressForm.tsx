import { Chain } from '@core/chain/Chain'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ScanQrView } from '@core/ui/qr/ScanQrView'
import { CameraPermissionGuard } from '@core/ui/qr/ScanQrView/CameraPermissionGuard'
import { useCore } from '@core/ui/state/core'
import { useCreateAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { AddressBookPageHeader } from '../../AddressSelector.styles'
import {
  AddressFormValues,
  useAddressSchema,
} from '../../hooks/useAddressSchema'
import {
  AddButton,
  Container,
  Form,
  FormField,
  FormFieldLabel,
  FormInput,
  InputWrapper,
} from './AddAddressForm.styles'

type AddAddressFormProps = {
  onClose: () => void
}

const QrScanner = ({ onFinish }: { onFinish: (address: string) => void }) => (
  <CameraPermissionGuard>
    <ScanQrView onFinish={onFinish} />
  </CameraPermissionGuard>
)

const AddAddressForm = ({ onClose }: AddAddressFormProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [state] = useCoreViewState<'addAddress'>()
  const selectedChain = state?.selectedChain
  const { getClipboardText } = useCore()
  const [showQrScanner, setShowQrScanner] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
  } = useAddressSchema({
    type: 'add',
  })

  useEffect(() => {
    if (selectedChain) {
      setValue('chain', selectedChain)
    }
  }, [selectedChain, setValue])

  const {
    mutate: addAddressBookItem,
    isPending: isAddAddressBookAddressPending,
    error: addAddressBookAddressError,
  } = useCreateAddressBookItemMutation()

  const handleAddAddress = (data: AddressFormValues) => {
    const { address, chain, title } = data

    addAddressBookItem(
      {
        id: uuidv4(),
        title,
        address,
        chain: chain as Chain,
      },
      {
        onSuccess: () => {
          onClose()
          navigate({ id: 'addressBook' })
        },
      }
    )
  }

  const handlePasteAddress = async () => {
    const { data } = await attempt(getClipboardText)

    if (data) {
      setValue('address', data)
    }
  }

  const handleScanQrCode = (address: string) => {
    setValue('address', address)
    setShowQrScanner(false)
  }

  const handleSelectChain = () => {
    navigate({
      id: 'chainSelection',
      state: {
        onChainSelect: (chain: Chain) => {
          setValue('chain', chain)
          navigate({
            id: 'addAddress',
            state: { selectedChain: chain },
          })
        },
      },
    })
  }

  if (showQrScanner) {
    return <QrScanner onFinish={handleScanQrCode} />
  }

  return (
    <>
      <AddressBookPageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => navigate({ id: 'addressBook' })}
          />
        }
        title={<PageHeaderTitle>{t('address_book')}</PageHeaderTitle>}
      />

      <Container>
        <Form onSubmit={handleSubmit(handleAddAddress)}>
          <FormField>
            <HStack
              alignItems="center"
              justifyContent={selectedChain ? 'flex-start' : 'space-between'}
              gap={12}
              style={{ cursor: 'pointer', padding: '12px' }}
              onClick={handleSelectChain}
            >
              {selectedChain ? (
                <>
                  <img
                    src={getChainEntityIconSrc(selectedChain)}
                    alt=""
                    style={{ width: 24, height: 24 }}
                  />
                  <Text color="contrast" size={14} weight="500">
                    {selectedChain}
                  </Text>
                </>
              ) : (
                <>
                  <Text color="shy" size={14} weight="500">
                    Select
                  </Text>
                  <ChevronRightIcon style={{ marginRight: '0' }} />
                </>
              )}
            </HStack>
          </FormField>

          <div>
            <FormFieldLabel htmlFor="title">
              {t('vault_settings_address_book_address_title_field')}
            </FormFieldLabel>
            <FormField>
              <FormInput
                id="title"
                {...register('title')}
                placeholder={t(
                  'vault_settings_address_book_address_placeholder'
                )}
              />
            </FormField>
            {errors.title && (
              <Text color="danger" size={12}>
                {errors.title.message}
              </Text>
            )}
          </div>

          <div>
            <FormFieldLabel htmlFor="address">
              {t('vault_settings_address_book_address_title_field')}
            </FormFieldLabel>
            <FormField>
              <InputWrapper>
                <FormInput
                  id="address"
                  {...register('address')}
                  placeholder={t(
                    'vault_settings_address_book_address_placeholder'
                  )}
                />
                <HStack gap={8}>
                  <IconButton
                    icon={<PasteIcon />}
                    onClick={handlePasteAddress}
                    title={t('successful_copy_text')}
                  />
                  <IconButton
                    icon={<CameraIcon />}
                    onClick={() => setShowQrScanner(true)}
                    title={t('scan_qr')}
                  />
                </HStack>
              </InputWrapper>
            </FormField>
            {errors.address && (
              <Text color="danger" size={12}>
                {errors.address.message}
              </Text>
            )}
          </div>

          <AddButton
            isLoading={isAddAddressBookAddressPending}
            isDisabled={!isValid || !isDirty}
            onClick={handleSubmit(handleAddAddress)}
          >
            {t('vault_settings_address_book_save_addresses_button')}
          </AddButton>

          {addAddressBookAddressError && (
            <Text color="danger" size={12}>
              {extractErrorMsg(addAddressBookAddressError)}
            </Text>
          )}
        </Form>
      </Container>
    </>
  )
}

export default AddAddressForm
