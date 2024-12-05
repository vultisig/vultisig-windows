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
import { text } from '../../../lib/ui/text';
import { asyncAttempt } from '../../../lib/utils/promise/asyncAttempt';
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

  return (
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {' '}
          {/* Action container */}
          <IconButton
            icon={<PasteIcon />}
            onClick={async () => {
              const newValue = await asyncAttempt(ClipboardGetText, undefined);

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
            onClick={() => {
              console.log('First action triggered');
            }}
          />
        </div>
      }
      actionPlacerStyles={{
        right: textInputHorizontalPadding,
        bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
      }}
    />
  );
};
