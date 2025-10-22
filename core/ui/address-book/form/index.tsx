import { Chain } from '@core/chain/Chain'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainInput } from '@core/ui/chain/inputs/ChainInput'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import { takeWholeSpaceAbsolutely } from '@lib/ui/css/takeWholeSpaceAbsolutely'
import { textInputHorizontalPadding } from '@lib/ui/css/textInput'
import { textInputHeight } from '@lib/ui/css/textInput'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { UseMutationResult } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'
import { z } from 'zod'

import { UploadQrView } from '../../qr/components/UploadQrView'
import { useCore } from '../../state/core'

const PositionQrCodeOverlay = styled.div`
  ${takeWholeSpaceAbsolutely}
  background: ${getColor('background')};
  isolation: isolate;
  ${vStack()}
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
  const [qrView, setQrView] = useState<null | 'scan' | 'upload'>(null)
  const walletCore = useAssertWalletCore()
  const { getClipboardText } = useCore()
  const { colors } = useTheme()

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
  const handlePaste = async () => {
    const { data } = await attempt(getClipboardText)
    if (data) {
      setValue('address', data, { shouldValidate: true })
    }
  }

  const handleScanSuccess = (address: string) => {
    setValue('address', address, { shouldValidate: true })
    setQrView(null)
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={qrView ? () => setQrView(null) : undefined}
          />
        }
        title={title}
      />
      <VStack fullHeight style={{ position: 'relative' }}>
        <PageContent gap={16} flexGrow scrollable>
          <ChainInput
            titleColor="contrast"
            value={watch('chain')}
            onChange={newChain => setValue('chain', newChain)}
            options={Object.values(Chain)}
          />
          <VStack gap={8}>
            <TextInput
              label={t('label')}
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
                <HStack>
                  <IconButton size="sm" onClick={() => setQrView('scan')}>
                    <CameraIcon />
                  </IconButton>
                  <IconButton
                    style={{
                      color: colors.textShyExtra.toCssValue(),
                    }}
                    size="sm"
                    onClick={handlePaste}
                  >
                    <PasteIcon />
                  </IconButton>
                </HStack>
              }
              actionPlacerStyles={{
                bottom: (textInputHeight - iconButtonSize.md) / 2,
                right: textInputHorizontalPadding,
              }}
            />
            {errors.address && (
              <Text color="danger" size={12}>
                {errors.address.message}
              </Text>
            )}
          </VStack>
          {error && (
            <Text color="danger" size={14}>
              {extractErrorMsg(error)}
            </Text>
          )}
        </PageContent>
        <PageFooter>
          <Button
            disabled={!isValid || !isDirty}
            loading={isLoading || isPending}
            type="submit"
          >
            {t('save')}
          </Button>
        </PageFooter>
        {qrView && (
          <PositionQrCodeOverlay>
            <Match
              value={qrView}
              scan={() => (
                <ScanQrView
                  onFinish={handleScanSuccess}
                  onUploadQrViewRequest={() => setQrView('upload')}
                />
              )}
              upload={() => (
                <UploadQrView
                  title={t('upload_qr_code_with_address')}
                  onFinish={handleScanSuccess}
                />
              )}
            />
          </PositionQrCodeOverlay>
        )}
      </VStack>
    </VStack>
  )
}
