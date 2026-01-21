import { Chain } from '@core/chain/Chain'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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

export const AddToAddressBookButton: FC<AddToAddressBookButtonProps> = ({
  address,
  chain,
}) => {
  const { t } = useTranslation()
  const { isLimited } = useCore()
  const navigate = useCoreNavigate()
  const addressBookItems = useAddressBookItems()

  const addressExists = addressBookItems.some(
    item => item.address === address && item.chain === chain
  )

  if (addressExists || isLimited) {
    return null
  }

  return (
    <StyledButton
      onClick={() =>
        navigate({
          id: 'createAddressBookItem',
          state: { address, chain },
        })
      }
    >
      <PlusIcon />
      {t('add_to_address_book')}
    </StyledButton>
  )
}
