import { Chain } from '@core/chain/Chain'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainInput } from '@core/ui/chain/inputs/ChainInput'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { UseMutationResult } from '@tanstack/react-query'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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
  defaultValues = { address: '', chain: Chain.Bitcoin, title: '' },
  error,
  isPending,
  onSubmit,
  title,
}) => {
  const { t } = useTranslation()
  const addressBookItems = useAddressBookItems()
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
    formState: { errors, isDirty, isLoading, isValid, isValidating },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<AddressBookFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
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
          <TextInput
            label={t('address')}
            placeholder={t('type_here')}
            {...register('address')}
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
          isDisabled={!isValid || !isDirty}
          isLoading={isLoading || isPending || isValidating}
          type="submit"
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
