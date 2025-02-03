import { ChangeEvent, ComponentProps, forwardRef, Ref } from 'react';
import styled, { css } from 'styled-components';

import { textInput } from '../css/textInput';
import { VStack } from '../layout/Stack';
import { Spinner } from '../loaders/Spinner';
import { LabelProp, UiProps } from '../props';
import { getColor } from '../theme/getters';
import { InputContainer } from './InputContainer';
import { InputLabel } from './InputLabel';

export type SharedTextInputProps = Partial<LabelProp> &
  ComponentProps<typeof TextInputContainer> & {
    onValueChange?: (value: string) => void;
    isLoading?: boolean;
    validationState?: 'valid' | 'invalid';
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

export const TextInputContainer = styled.input<{
  validationState?: 'valid' | 'invalid';
}>`
  ${textInput};

  ${({ validationState }) =>
    validationState === 'valid'
      ? css`
          border-color: ${getColor('primary')};

          &:focus,
          &:hover {
            border-color: ${getColor('primary')};
          }
        `
      : validationState === 'invalid' &&
        css`
          border-color: ${getColor('danger')};

          &:focus,
          &:hover {
            border-color: ${getColor('danger')};
          }
        `}
`;

export const TextInputLoader = (props: UiProps) => (
  <TextInputContainer as="div" {...props}>
    <VStack fullHeight justifyContent="center">
      <Spinner />
    </VStack>
  </TextInputContainer>
);
