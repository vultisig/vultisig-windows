import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddressBookItem } from '../../../../../lib/types/address-book';
import { Button } from '../../../../../lib/ui/buttons/Button';
import { UnstyledButton } from '../../../../../lib/ui/buttons/UnstyledButton';
import SquareAndPencilIcon from '../../../../../lib/ui/icons/SquareAndPencilIcon';
import { Text } from '../../../../../lib/ui/text';
import { PageHeader } from '../../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle';
import ModifyAddressForm from '../modifyAddressForm/ModifyAddAddressForm';
import AddressBookListItem from './AddressBookListItem/AddressBookListItem';
import { Container, Main } from './AddressesListView.styles';

type AddressesListViewProps = {
  addressBookItems: AddressBookItem[];
  onOpenAddAddressView: () => void;
  isEditModeOn: boolean;
  onEditModeToggle: () => void;
};

const AddressesListView = ({
  addressBookItems,
  onOpenAddAddressView,
  isEditModeOn,
  onEditModeToggle,
}: AddressesListViewProps) => {
  const [modifyAddressItemId, setModifyAddressItemId] = useState<string | null>(
    null
  );
  const { t } = useTranslation();

  const handleDeleteAddress = (id: string) => {
    // TODO: @antonio to implement when BE is ready
    console.log('## id', id);
  };

  const defaultValues = useMemo(
    () => addressBookItems.find(item => item.id === modifyAddressItemId),
    [addressBookItems, modifyAddressItemId]
  );

  if (modifyAddressItemId !== null && defaultValues) {
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
        <Button onClick={onOpenAddAddressView}>
          {t('vault_settings_address_book_add_addresses_button')}
        </Button>
      </Container>
    </>
  );
};

export default AddressesListView;
