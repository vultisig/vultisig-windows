import { Chain } from '@core/chain/Chain'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { useCreateAddressBookItem } from '@core/ui/address-book/hooks/useCreateAddressBookItem'
import { useUpdateAddressBookItem } from '@core/ui/address-book/hooks/useUpdateAddressBookItem'
import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainInput } from '@core/ui/chain/inputs/ChainInput'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton, iconButtonSizeRecord } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { UseMutationResult } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const FixedScanQRView = styled(ScanQrView)`
  position: fixed;
  inset: 0;
`

export type AddressBookFormValues = Pick<
  AddressBookItem,
  'address' | 'chain' | 'title'
>

type AddressBookFormProps = {
  defaultValues?: AddressBookFormValues
  error: UseMutationResult['error']
  isPending: UseMutationResult['isPending']
  onSubmit: (values: AddressBookFormValues) => void
  title: string
}

export const AddressBookForm: FC<AddressBookFormProps> = ({
  defaultValues = { address: '', chain: undefined, title: '' },
  error,
  isPending,
  onSubmit,
  title,
}) => {
  const { t } = useTranslation()
  const addressBookItems = useAddressBookItems()
  const walletCore = useAssertWalletCore()
  const [state] = useCoreViewState<'updateAddressBookItem'>()
  const { getClipboardText } = useCore()
  const [showScanner, setShowScanner] = useState(false)
  const {
    createAddressBookItem,
    error: createError,
    isPending: isCreatePending,
  } = useCreateAddressBookItem()
  const {
    updateAddressBookItem,
    error: updateError,
    isPending: isUpdatePending,
  } = useUpdateAddressBookItem()

  const schema = z
    .object({
      address: z
        .string()
        .min(1, t('vault_settings_address_book_address_min_length_error')),
      chain: z.custom<Chain>(),
      title: z
        .string()
        .min(1, t('vault_settings_address_book_title_min_length_error'))
        .max(50, t('vault_settings_address_book_title_max_length_error')),
    })
    .superRefine(async (data, ctx) => {
      const { address, chain } = data

      const isValid = isValidAddress({
        chain,
        address,
        walletCore,
      })

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: t('vault_settings_address_book_invalid_address_error'),
        })
      }

      const isAddressAlreadyAdded = addressBookItems.some(
        item =>
          item.address === address && item.address !== defaultValues?.address
      )

      if (isAddressAlreadyAdded) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: t('vault_settings_address_book_repeated_address_error'),
        })
      }
    })

  const {
    formState: { errors, isDirty, isLoading, isValid },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<AddressBookFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  const handleSubmitForm = (values: AddressBookFormValues) => {
    if (state?.id) {
      updateAddressBookItem(state.id, values)
    } else {
      createAddressBookItem(values)
    }
    onSubmit(values)
  }

  const handlePaste = async () => {
    const { data } = await attempt(getClipboardText)
    if (data) {
      setValue('address', data)
    }
  }

  const handleScanSuccess = (address: string) => {
    setValue('address', address)
    setShowScanner(false)
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(handleSubmitForm)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{title || t('add_address')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <ChainInput
          value={watch('chain')}
          onChange={newChain => setValue('chain', newChain)}
        />
        <VStack gap={8}>
          <TextInput
            label={t('title')}
            placeholder={t('type_here')}
            {...register('title')}
          />
          {errors.title && (
            <Text color="danger" size={12}>
              {errors.title.message}
            </Text>
          )}
        </VStack>
        <VStack gap={8}>
          <ActionInsideInteractiveElement
            render={({ actionSize }) => (
              <TextInput
                label={t('address')}
                placeholder={t('type_here')}
                {...register('address')}
                style={{
                  paddingRight: actionSize.width + textInputHorizontalPadding,
                }}
              />
            )}
            action={
              <HStack gap={8}>
                <IconButton icon={<PasteIcon />} onClick={handlePaste} />
                <IconButton
                  icon={<CameraIcon fontSize={20} />}
                  onClick={() => setShowScanner(true)}
                />
              </HStack>
            }
            actionPlacerStyles={{
              right: textInputHorizontalPadding,
              bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
            }}
          />
          {errors.address && (
            <Text color="danger" size={12}>
              {errors.address.message}
            </Text>
          )}
        </VStack>
        {(error || createError || updateError) && (
          <Text color="danger" size={14}>
            {extractErrorMsg(error || createError || updateError)}
          </Text>
        )}
      </PageContent>
      <PageFooter>
        <Button
          isDisabled={!isValid || !isDirty}
          isLoading={
            isLoading || isPending || isCreatePending || isUpdatePending
          }
          type="submit"
        >
          {t('save')}
        </Button>
      </PageFooter>
      {showScanner && (
        <Modal
          title=""
          onClose={() => setShowScanner(false)}
          withDefaultStructure={false}
        >
          <FixedScanQRView onFinish={handleScanSuccess} />
        </Modal>
      )}
    </VStack>
  )
}
