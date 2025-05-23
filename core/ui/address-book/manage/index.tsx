import { Chain } from '@core/chain/Chain'
import {
  AddressFormValues,
  useAddressSchema,
} from '@core/ui/address-book/hooks/useAddressSchema'
import { ChainInput } from '@core/ui/chain/inputs/ChainInput'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  useAddressBookItems,
  useCreateAddressBookItemMutation,
  useUpdateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

export const ManageAddressPage = () => {
  const { t } = useTranslation()
  const [{ id }] = useCoreViewState<'manageAddress'>()
  const [chain, setChain] = useState<Chain>(Chain.Bitcoin)
  const addressBookItems = useAddressBookItems()
  const createAddressBookItem = useCreateAddressBookItemMutation()
  const updateAddressBookItem = useUpdateAddressBookItemMutation()
  const navigateBack = useNavigateBack()

  const addressBookItem = useMemo(() => {
    return addressBookItems.find(item => item.id === id)
  }, [addressBookItems, id])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
  } = useAddressSchema(
    addressBookItem
      ? {
          chain,
          defaultValues: addressBookItem,
          type: 'modify',
        }
      : {
          chain,
          type: 'add',
        }
  )

  const handleManageAddress = (data: AddressFormValues) => {
    const { address, title } = data

    if (addressBookItem) {
      updateAddressBookItem.mutate(
        {
          id: addressBookItem.id,
          fields: {
            address,
            chain,
            title,
          },
        },
        {
          onSuccess: navigateBack,
        }
      )
    } else {
      createAddressBookItem.mutate(
        {
          address,
          chain,
          id: uuidv4(),
          order: addressBookItems.length + 1,
          title,
        },
        {
          onSuccess: navigateBack,
        }
      )
    }
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(handleManageAddress)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {addressBookItem ? t('edit_address') : t('add_address')}
          </PageHeaderTitle>
        }
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <ChainInput value={chain} onChange={setChain} />
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
        {createAddressBookItem.error && (
          <Text color="danger" size={14}>
            {extractErrorMsg(createAddressBookItem.error)}
          </Text>
        )}
        {updateAddressBookItem.error && (
          <Text color="danger" size={14}>
            {extractErrorMsg(updateAddressBookItem.error)}
          </Text>
        )}
      </PageContent>
      <PageFooter>
        <Button
          isDisabled={!isValid || !isDirty}
          isLoading={
            createAddressBookItem.isPending ||
            isLoading ||
            isValidating ||
            updateAddressBookItem.isPending
          }
          onClick={handleSubmit(handleManageAddress)}
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
