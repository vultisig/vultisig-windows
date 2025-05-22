import { Chain } from '@core/chain/Chain'
import { chainInfos } from '@core/chain/coin/chainInfo'
import {
  AddressFormValues,
  useAddressSchema,
} from '@core/ui/address-book/hooks/useAddressSchema'
import {
  ChainOption,
  customSelectMenu,
  customSelectOption,
  customSelectStyles,
  customSingleValue,
} from '@core/ui/address-book/manage/styles'
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
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'

const StyledPanel = styled(Panel)`
  padding: 5px 0;
`

export const ManageAddressPage = () => {
  const { t } = useTranslation()
  const [{ id }] = useCoreViewState<'manageAddress'>()
  const addressBookItems = useAddressBookItems()
  const createAddressBookItem = useCreateAddressBookItemMutation()
  const updateAddressBookItem = useUpdateAddressBookItemMutation()
  const navigateBack = useNavigateBack()

  const options = useMemo(() => {
    const coins = Object.values(chainInfos)

    return coins.map(({ chain, ticker, logo }, index) => ({
      value: chain,
      label: ticker,
      logo: logo,
      isLastOption: index === coins.length - 1,
    }))
  }, [])

  const addressBookItem = useMemo(() => {
    return addressBookItems.find(item => item.id === id)
  }, [addressBookItems, id])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
    control,
  } = useAddressSchema(
    addressBookItem
      ? {
          type: 'modify',
          defaultValues: addressBookItem,
        }
      : {
          type: 'add',
        }
  )

  const handleAddAddress = (data: AddressFormValues) => {
    const { address, chain, title } = data

    if (addressBookItem) {
      updateAddressBookItem.mutate(
        {
          id: addressBookItem.id,
          fields: {
            title,
            address,
            chain: chain as Chain,
          },
        },
        {
          onSuccess: navigateBack,
        }
      )
    } else {
      createAddressBookItem.mutate(
        {
          id: uuidv4(),
          title,
          address,
          chain: chain as Chain,
          order: addressBookItems.length + 1,
        },
        {
          onSuccess: navigateBack,
        }
      )
    }
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(handleAddAddress)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('edit_address')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <Controller
          name="chain"
          control={control}
          render={({ field }) => {
            const [defaultValue] = options

            return (
              <StyledPanel>
                <Select<ChainOption>
                  value={
                    options.find(option => option.value === field.value) || null
                  }
                  defaultValue={defaultValue}
                  onChange={selectedOption =>
                    field.onChange(selectedOption?.value)
                  }
                  onBlur={field.onBlur}
                  options={options}
                  components={{
                    Menu: customSelectMenu,
                    Option: customSelectOption,
                    SingleValue: customSingleValue,
                  }}
                  styles={customSelectStyles}
                />
              </StyledPanel>
            )
          }}
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
          onClick={handleSubmit(handleAddAddress)}
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
