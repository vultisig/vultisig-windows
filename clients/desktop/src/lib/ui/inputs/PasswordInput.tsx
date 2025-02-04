import { ComponentPropsWithoutRef } from 'react';

import { ActionInsideInteractiveElement } from '../base/ActionInsideInteractiveElement';
import { IconButton, iconButtonSizeRecord } from '../buttons/IconButton';
import { textInputHeight, textInputHorizontalPadding } from '../css/textInput';
import { useBoolean } from '../hooks/useBoolean';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { TextInput } from './TextInput';

export const PasswordInput: React.FC<
  ComponentPropsWithoutRef<typeof TextInput>
> = ({ ...rest }) => {
  const [shouldHideValue, { toggle }] = useBoolean(true);

  return (
    <ActionInsideInteractiveElement
      render={({ actionSize }) => (
        <TextInput
          type={shouldHideValue ? 'password' : 'text'}
          autoComplete="off"
          spellCheck="false"
          {...rest}
          style={{
            paddingRight: actionSize.width + textInputHorizontalPadding,
          }}
        />
      )}
      action={
        <IconButton
          icon={shouldHideValue ? <EyeOffIcon /> : <EyeIcon />}
          onClick={toggle}
        />
      }
      actionPlacerStyles={{
        right: textInputHorizontalPadding,
        bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
      }}
    />
  );
};
