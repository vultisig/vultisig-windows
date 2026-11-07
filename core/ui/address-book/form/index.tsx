import { AddressBookChainInput } from '@core/ui/address-book/AddressBookChainInput'
import { AddressBookItem } from '@core/ui/address-book/model'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { settingsFieldSurface } from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Match } from '@lib/ui/base/Match'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { takeWholeSpaceAbsolutely } from '@lib/ui/css/takeWholeSpaceAbsolutely'
import { textInputHorizontalPadding } from '@lib/ui/css/textInput'
import { CameraFilledIcon } from '@lib/ui/icons/CameraFilledIcon'
import { CopiesFilledIcon } from '@lib/ui/icons/CopiesFilledIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { UseMutationResult } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { z } from 'zod'

import { InputPasteAction } from '../../components/InputPasteAction'
import { UploadQrView } from '../../qr/components/UploadQrView'
import { isAddressAlreadyAdded } from './isAddressAlreadyAdded'

const PositionQrCodeOverlay = styled.div`
  ${takeWholeSpaceAbsolutely}
  background: ${getColor('background')};
  isolation: isolate;
  ${vStack()}
`

const fieldHeight = 52

const AddressBookTextInput = styled(TextInput)`
  ${settingsFieldSurface};
  color: ${getColor('text')};
  font-weight: 500;
  height: ${fieldHeight}px;
  line-height: 20px;
  padding: 15px;

  &::placeholder {
    color: ${getColor('textShy')};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }
`

const FieldLabel = styled(SettingsBaselineText).attrs({
  as: 'span',
  color: 'shy',
  variant: 'stationBodyS',
})``

const fieldActionTones = css`
  --icon-accent: ${getColor('textShyExtra')};
  color: ${getColor('text')};
`

const FieldAction = styled(IconButton)`
  ${fieldActionTones};
`

const FieldPasteAction = styled(InputPasteAction)`
  ${fieldActionTones};
`

export type AddressBookFormValues = Pick<
  AddressBookItem,
  'address' | 'chain' | 'title'
>

type AddressBookFormProps = {
  defaultValues?: AddressBookFormValues
  editedItemId?: string
  error: UseMutationResult['error']
  isPending: UseMutationResult['isPending']
  onSubmit: (values: AddressBookFormValues) => void
  title: string
  onBack?: () => void
}

export const AddressBookForm: FC<AddressBookFormProps> = ({
  defaultValues = { address: '', chain: undefined, title: '' },
  editedItemId,
  error,
  isPending,
  onSubmit,
  title,
  onBack,
}) => {
  const { t } = useTranslation()
  const addressBookItems = useAddressBookItems()
  const [qrView, setQrView] = useState<null | 'scan' | 'upload'>(null)
  const walletCore = useAssertWalletCore()

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

      if (
        isAddressAlreadyAdded({
          items: addressBookItems,
          address,
          chain,
          editedItemId,
        })
      ) {
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
    mode: 'onTouched',
    defaultValues,
  })

  const handleScanSuccess = (address: string) => {
    setValue('address', address, { shouldValidate: true })
    setQrView(null)
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <SettingsPageHeader
        onBack={qrView ? () => setQrView(null) : onBack}
        title={title}
      />
      <VStack fullHeight style={{ position: 'relative' }}>
        <SettingsPageContent gap={12} flexGrow scrollable>
          <AddressBookChainInput
            value={watch('chain')}
            onChange={newChain => {
              if (newChain) {
                setValue('chain', newChain)
              }
            }}
          />
          <VStack gap={8}>
            <AddressBookTextInput
              label={<FieldLabel>{t('label')}</FieldLabel>}
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
                <AddressBookTextInput
                  label={<FieldLabel>{t('address')}</FieldLabel>}
                  placeholder={t('type_here')}
                  {...register('address')}
                  style={{
                    paddingRight: actionSize.width + textInputHorizontalPadding,
                  }}
                />
              )}
              action={
                <HStack>
                  <FieldAction size="sm" onClick={() => setQrView('scan')}>
                    <CameraFilledIcon />
                  </FieldAction>
                  <FieldPasteAction
                    icon={<CopiesFilledIcon />}
                    onPaste={value =>
                      setValue('address', value, { shouldValidate: true })
                    }
                  />
                </HStack>
              }
              actionPlacerStyles={{
                bottom: (fieldHeight - iconButtonSize.sm) / 2,
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
        </SettingsPageContent>
        <SettingsPageFooter>
          <SettingsCtaButton
            disabled={!isValid || !isDirty}
            loading={isLoading || isPending}
            type="submit"
          >
            {t('save')}
          </SettingsCtaButton>
        </SettingsPageFooter>
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
