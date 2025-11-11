import { Chain } from '@core/chain/Chain'
import { AddressBookItem } from '@core/ui/address-book/model'
import {
  useAddressBookItemOrders,
  useAddressBookItems,
  useCreateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const StyledButton = styled.button`
  align-items: center;
  color: ${getColor('success')};
  cursor: pointer;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
  height: 28px;
  padding: 6px 12px;
  transition: all 0.2s;
  white-space: nowrap;

  border-radius: 20px;
  border: 0.5px solid ${getColor('success')};
  background: #042436;

  &:hover {
    opacity: 0.9;
  }

  svg {
    font-size: 16px;
  }
`

type AddToAddressBookButtonProps = {
  address: string
  chain: Chain
}

type FormValues = Pick<AddressBookItem, 'title'>

export const AddToAddressBookButton: FC<AddToAddressBookButtonProps> = ({
  address,
  chain,
}) => {
  const { t } = useTranslation()
  const addressBookItems = useAddressBookItems()
  const addressBookItemOrders = useAddressBookItemOrders()
  const { mutate, error, isPending } = useCreateAddressBookItemMutation()

  // Check if address already exists in address book
  const addressExists = addressBookItems.some(
    item => item.address === address && item.chain === chain
  )

  const schema = z.object({
    title: z
      .string()
      .min(1, t('vault_settings_address_book_title_min_length_error'))
      .max(50, t('vault_settings_address_book_title_max_length_error')),
  })

  const {
    formState: { errors, isDirty, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { title: '' },
  })

  const handleAddAddress = (onClose: () => void) => (values: FormValues) => {
    const { title } = values

    mutate(
      {
        address,
        chain,
        id: uuidv4(),
        order: getLastItemOrder(addressBookItemOrders),
        title,
      },
      {
        onSuccess: () => {
          onClose()
          reset()
        },
      }
    )
  }

  // Don't show button if address already exists
  if (addressExists) {
    return null
  }

  return (
    <Opener
      renderOpener={({ onOpen }: { onOpen: () => void }) => (
        <StyledButton onClick={onOpen}>
          <PlusIcon />
          {t('add_to_address_book')}
        </StyledButton>
      )}
      renderContent={({ onClose }: { onClose: () => void }) => (
        <Modal
          isOpen={true}
          onClose={() => {
            onClose()
            reset()
          }}
          title={t('add_to_address_book')}
        >
          <VStack
            as="form"
            onSubmit={handleSubmit(handleAddAddress(onClose))}
            gap={16}
          >
            <VStack gap={8}>
              <Text color="shy" size={14} weight="500">
                {t('chain')}
              </Text>
              <Text size={14}>{chain}</Text>
            </VStack>
            <VStack gap={8}>
              <Text color="shy" size={14} weight="500">
                {t('address')}
              </Text>
              <Text
                size={14}
                style={{
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                }}
              >
                {address}
              </Text>
            </VStack>
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
            {error && (
              <Text color="danger" size={14}>
                {extractErrorMsg(error)}
              </Text>
            )}
            <VStack gap={8}>
              <Button
                disabled={!isValid || !isDirty}
                loading={isPending}
                type="submit"
              >
                {t('save')}
              </Button>
              <Button kind="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
            </VStack>
          </VStack>
        </Modal>
      )}
    />
  )
}
