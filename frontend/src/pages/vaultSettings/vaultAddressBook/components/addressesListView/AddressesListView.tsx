import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../../lib/ui/buttons/Button';
import { UnstyledButton } from '../../../../../lib/ui/buttons/UnstyledButton';
import SquareAndPencilIcon from '../../../../../lib/ui/icons/SquareAndPencilIcon';
import { Text } from '../../../../../lib/ui/text';
import { extractError } from '../../../../../lib/utils/error/extractError';
import { PageHeader } from '../../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle';
import { useDeleteAddressBookItemMutation } from '../../../../../vault/mutations/useDeleteAddressBookItemMutation';
import { useAddressBookItemsQuery } from '../../../../../vault/queries/useAddressBookItemsQuery';
import ModifyAddressForm from '../modifyAddressForm/ModifyAddAddressForm';
import AddressBookListItem from './AddressBookListItem/AddressBookListItem';
import { ButtonWrapper, Container, Main } from './AddressesListView.styles';

type AddressesListViewProps = {
  onOpenAddAddressView: () => void;
  isEditModeOn: boolean;
  onEditModeToggle: () => void;
};

const AddressesListView = ({
  onOpenAddAddressView,
  isEditModeOn,
  onEditModeToggle,
}: AddressesListViewProps) => {
  const [modifyAddressItemId, setModifyAddressItemId] = useState<string | null>(
    null
  );
  const isModifyViewOpen = modifyAddressItemId !== null;
  const { t } = useTranslation();
  const {
    data: addressBookItems,
    isFetching: isFetchingAddressBookItems,
    error: addressBookItemsError,
  } = useAddressBookItemsQuery();

  const {
    mutate: deleteAddressBookItem,
    isPending: isDeleteAddressBookItemLoading,
    error: deleteAddressBookItemError,
  } = useDeleteAddressBookItemMutation();

  const isLoading =
    isFetchingAddressBookItems || isDeleteAddressBookItemLoading;
  const error = addressBookItemsError || deleteAddressBookItemError;
  const defaultValues = useMemo(
    () => addressBookItems.find(item => item.id === modifyAddressItemId),
    [addressBookItems, modifyAddressItemId]
  );

  const handleDeleteAddress = (id: string) => {
    void deleteAddressBookItem(id);
  };

  if (isModifyViewOpen && defaultValues) {
    return (
      <>
        <PageHeader
          primaryControls={
            <PageHeaderBackButton
              onClick={() => setModifyAddressItemId(null)}
            />
          }
          title={
            <PageHeaderTitle>
              {t('vault_settings_address_book_edit_addresses_title')}
            </PageHeaderTitle>
          }
        />
        <ModifyAddressForm
          defaultValues={defaultValues}
          onClose={() => setModifyAddressItemId(null)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_address_book')}</PageHeaderTitle>
        }
        secondaryControls={
          isEditModeOn ? (
            <UnstyledButton onClick={onEditModeToggle}>
              <Text color="contrast" size={16} weight={700}>
                {t('done')}
              </Text>
            </UnstyledButton>
          ) : (
            <UnstyledButton onClick={onEditModeToggle}>
              <SquareAndPencilIcon />
            </UnstyledButton>
          )
        }
      />
      <Container>
        <Main>
          {addressBookItems.map(({ address, id, title, chain }) => (
            <AddressBookListItem
              key={id}
              id={id}
              title={title}
              address={address}
              chain={chain}
              isEditModeOn={isEditModeOn}
              onClick={() => setModifyAddressItemId(id)}
              handleDeleteAddress={handleDeleteAddress}
            />
          ))}
        </Main>
        <ButtonWrapper>
          <Button isLoading={isLoading} onClick={onOpenAddAddressView}>
            {t('vault_settings_address_book_add_addresses_button')}
          </Button>
          {error && (
            <Text color="danger" size={12}>
              {extractError(error)}
            </Text>
          )}
        </ButtonWrapper>
      </Container>
    </>
  );
};

export default AddressesListView;
