import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef } from 'react';

import { UnstyledButton } from '../../../../../../lib/ui/buttons/UnstyledButton';
import { BinIcon } from '../../../../../../lib/ui/icons/BinIcon';
import { MenuIcon } from '../../../../../../lib/ui/icons/MenuIcon';
import {
  ColumnOneBothRowsItem,
  ColumnThreeRowOneItem,
  ColumnTwoRowOneItem,
  ColumnTwoRowTwoItem,
  ItemWrapper,
  ListItem,
  ModifyButtonWrapper,
} from './AddressBookListItem.styles';

type AddressBookListItem = {
  id: string;
  title: string;
  address: string;
  chain: string;
  isEditModeOn: boolean;
  handleDeleteAddress: (id: string) => void;
};

const AddressBookItem = ({
  id,
  title,
  address,
  chain,
  isEditModeOn,
  handleDeleteAddress,
}: AddressBookListItem) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemRef.current && isEditModeOn) {
      const cleanupFn = draggable({
        element: itemRef.current,
      });

      return () => {
        cleanupFn();
      };
    }
  }, [isEditModeOn]);

  return (
    <ItemWrapper ref={itemRef} style={{ display: 'flex' }}>
      {isEditModeOn && (
        <ModifyButtonWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <UnstyledButton>
            <MenuIcon size={30} />
          </UnstyledButton>
        </ModifyButtonWrapper>
      )}
      <ListItem>
        <ColumnOneBothRowsItem color="primary">{title}</ColumnOneBothRowsItem>
        <ColumnTwoRowOneItem color="contrast">{title}</ColumnTwoRowOneItem>
        <ColumnTwoRowTwoItem color="contrast">{address}</ColumnTwoRowTwoItem>
        <ColumnThreeRowOneItem color="shy">{chain}</ColumnThreeRowOneItem>
      </ListItem>
      {isEditModeOn && (
        <ModifyButtonWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <UnstyledButton onClick={() => handleDeleteAddress(id)}>
            <BinIcon size={30} />
          </UnstyledButton>
        </ModifyButtonWrapper>
      )}
    </ItemWrapper>
  );
};

export default AddressBookItem;
