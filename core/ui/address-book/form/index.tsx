import { Chain } from '@core/chain/Chain'
import {
  AddressFormValues,
  useAddressSchema,
} from '@core/ui/address-book/hooks/useAddressSchema'
import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainInput } from '@core/ui/chain/inputs/ChainInput'
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
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface AddressFormProps {
  chain: Chain
  defaultValues?: AddressBookItem
  error: Error | null
  isPending: boolean
  onSubmit: (chain: Chain, values: AddressFormValues) => void
  title: string
  type: 'add' | 'modify'
}

export const AddressForm: FC<AddressFormProps> = ({
  error,
  isPending,
  onSubmit,
  title,
  ...rest
}) => {
  const { t } = useTranslation()
  const [chain, setChain] = useState<Chain>(rest.chain)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isLoading, isValidating },
  } = useAddressSchema(rest)

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(values => onSubmit(chain, values))}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
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
          onClick={handleSubmit(values => onSubmit(chain, values))}
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
