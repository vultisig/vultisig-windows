import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ClipboardGetText } from '../../../../wailsjs/runtime/runtime';
import { ActionInsideInteractiveElement } from '../../../lib/ui/base/ActionInsideInteractiveElement';
import {
  IconButton,
  iconButtonSizeRecord,
} from '../../../lib/ui/buttons/IconButton';
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '../../../lib/ui/css/textInput';
import AddressBookIcon from '../../../lib/ui/icons/AddressBookIcon';
import { CameraIcon } from '../../../lib/ui/icons/CameraIcon';
import { PasteIcon } from '../../../lib/ui/icons/PasteIcon';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { HStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { text } from '../../../lib/ui/text';
import { asyncAttempt } from '../../../lib/utils/promise/asyncAttempt';
import AddressSelector from '../addressSelector/AddressSelector';
import { useSendReceiver } from '../state/receiver';

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    weight: 400,
  })}
`;

export const ManageReceiver = () => {
  const [value, setValue] = useSendReceiver();
  const { t } = useTranslation();
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);

  if (isAddressBookOpen) {
    return (
      <Modal title="" withDefaultStructure={false}>
        <AddressSelector
          onAddressClick={address => {
            setValue(address);
            setIsAddressBookOpen(false);
          }}
          onClose={() => setIsAddressBookOpen(false)}
        />
      </Modal>
    );
  }

  return (
    <>
      <ActionInsideInteractiveElement
        render={({ actionSize }) => (
          <Input
            label={t('to')}
            placeholder={t('enter_address')}
            value={value}
            onValueChange={setValue}
            style={{
              paddingRight: actionSize.width + textInputHorizontalPadding,
            }}
          />
        )}
        action={
          <HStack gap={8}>
            <IconButton
              icon={<PasteIcon />}
              onClick={async () => {
                const newValue = await asyncAttempt(
                  ClipboardGetText,
                  undefined
                );

                if (newValue) {
                  setValue(newValue);
                }
              }}
            />
            <IconButton
              icon={<CameraIcon size={20} />}
              onClick={() => {
                console.log('Second action triggered');
              }}
            />
            <IconButton
              icon={<AddressBookIcon />}
              onClick={() => setIsAddressBookOpen(true)}
            />
          </HStack>
        }
        actionPlacerStyles={{
          right: textInputHorizontalPadding,
          bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
        }}
      />
    </>
  );
};
