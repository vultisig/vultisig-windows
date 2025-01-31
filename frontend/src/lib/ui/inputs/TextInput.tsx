import { ChangeEvent, ComponentProps, forwardRef, Ref } from 'react';
import styled, { css } from 'styled-components';

import { UnstyledButton } from '../buttons/UnstyledButton';
import { textInput } from '../css/textInput';
import { CircledCloseIcon } from '../icons/CircledCloseIcon';
import { VStack } from '../layout/Stack';
import { Spinner } from '../loaders/Spinner';
import { LabeledComponentProps, UIComponentProps } from '../props';
import { getColor } from '../theme/getters';
import { InputContainer } from './InputContainer';
import { InputLabel } from './InputLabel';

export type SharedTextInputProps = Partial<LabeledComponentProps> &
  ComponentProps<typeof TextInputContainer> & {
    onValueChange?: (value: string) => void;
    isLoading?: boolean;
    isValid?: boolean;
    isInvalid?: boolean;
    withResetValueBtn?: boolean;
  };

export interface TextInputProps
  extends ComponentProps<typeof TextInputContainer>,
    SharedTextInputProps {
  inputOverlay?: React.ReactNode;
}

export const TextInput = forwardRef(function TextInputInner(
  {
    onValueChange,
    inputOverlay,
    isLoading,
    className,
    label,
    withResetValueBtn,
    ...props
  }: TextInputProps,
  ref: Ref<HTMLInputElement> | null
) {
  return (
    <InputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <InputWr>
        {isLoading ? (
          <TextInputLoader className={className} />
        ) : (
          <TextInputContainer
            {...props}
            className={className}
            ref={ref}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              props.onChange?.(event);
              onValueChange?.(event.currentTarget.value);
            }}
          />
        )}
        {inputOverlay}
        {!isLoading && withResetValueBtn && (
          <ClearInputBtn onClick={() => onValueChange?.('')}>
            <CircledCloseIcon />
          </ClearInputBtn>
        )}
      </InputWr>
    </InputContainer>
  );
});

const InputWr = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ClearInputBtn = styled(UnstyledButton)`
  position: absolute;
  right: 16px;
`;

export const TextInputContainer = styled.input<{
  isValid?: boolean;
  isInvalid?: boolean;
}>`
  ${textInput};

  ${({ isValid, isInvalid }) =>
    isValid
      ? css`
          border-color: ${getColor('primary')};

          &:focus,
          &:hover {
            border-color: ${getColor('primary')};
          }
        `
      : isInvalid &&
        css`
          border-color: ${getColor('danger')};

          &:focus,
          &:hover {
            border-color: ${getColor('danger')};
          }
        `}
`;

export const TextInputLoader = (props: UIComponentProps) => (
  <TextInputContainer as="div" {...props}>
    <VStack fullHeight justifyContent="center">
      <Spinner />
    </VStack>
  </TextInputContainer>
);
