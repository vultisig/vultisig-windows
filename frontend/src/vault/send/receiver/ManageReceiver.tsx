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
        <IconButton
          icon={<PasteIcon />}
          onClick={async () => {
            const newValue = await asyncAttempt(ClipboardGetText, undefined);

            if (newValue) {
              setValue(newValue);
            }
          }}
        />
      }
      actionPlacerStyles={{
        right: textInputHorizontalPadding,
        bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
      }}
    />
  );
};
