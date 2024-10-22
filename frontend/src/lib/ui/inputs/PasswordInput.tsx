import { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { ActionInsideInteractiveElement } from '../base/ActionInsideInteractiveElement';
import { IconButton, iconButtonSizeRecord } from '../buttons/IconButton';
import { textInputHeight, textInputHorizontalPadding } from '../css/textInput';
import { useBoolean } from '../hooks/useBoolean';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { text } from '../text';
import { TextInput } from './TextInput';

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
  })}
`;

export const PasswordInput: React.FC<
  ComponentPropsWithoutRef<typeof TextInput>
> = ({ ...rest }) => {
  const [shouldHideValue, { toggle }] = useBoolean(true);

  return (
    <ActionInsideInteractiveElement
      render={({ actionSize }) => (
        <Input
          type={shouldHideValue ? 'password' : 'text'}
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
