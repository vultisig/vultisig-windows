import { forwardRef, ReactNode, Ref, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { borderRadius } from '../css/borderRadius';
import { centerContent } from '../css/centerContent';
import { HStack } from '../layout/Stack';
import { text } from '../text';
import { TextInput, TextInputProps } from './TextInput';

type AmountTextInputProps = Omit<TextInputProps, 'value' | 'onValueChange'> & {
  value: number | null;
  onValueChange?: (value: number | null) => void;
  unit?: ReactNode;
  shouldBePositive?: boolean;
  shouldBeInteger?: boolean;
  suggestion?: ReactNode;
};

const UnitContainer = styled.div`
  ${borderRadius.s};

  position: absolute;
  left: 12px;
  ${centerContent};
`;

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    size: 16,
    weight: '400',
  })}
`;

export const AmountTextInput = forwardRef(function AmountInputInner(
  {
    onValueChange,
    unit,
    value,
    shouldBePositive,
    shouldBeInteger,
    suggestion,
    label,
    placeholder,
    type = 'number',
    ...props
  }: AmountTextInputProps,
  ref: Ref<HTMLInputElement> | null
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const valueAsString = value?.toString() ?? '';
  const [inputValue, setInputValue] = useState<string>(valueAsString);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === inputRef.current) {
        e.preventDefault();
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (input) {
        input.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <Input
      {...props}
      style={unit ? { paddingLeft: 36 } : undefined}
      type={type}
      label={
        <HStack
          alignItems="center"
          justifyContent="space-between"
          gap={16}
          fullWidth
        >
          {label}
          {suggestion}
        </HStack>
      }
      placeholder={placeholder ?? 'Enter amount'}
      value={
        Number(valueAsString) === Number(inputValue)
          ? inputValue
          : valueAsString
      }
      ref={ref || inputRef}
      inputOverlay={unit ? <UnitContainer>{unit}</UnitContainer> : undefined}
      onValueChange={(value: string) => {
        if (shouldBePositive) {
          value = value.replace(/-/g, '');
        }

        if (value === '') {
          setInputValue('');
          onValueChange?.(null);
          return;
        }

        const parse = shouldBeInteger ? parseInt : parseFloat;
        const valueAsNumber = parse(value);
        if (isNaN(valueAsNumber)) {
          return;
        }

        setInputValue(
          valueAsNumber.toString() !== value ? value : valueAsNumber.toString()
        );
        onValueChange?.(valueAsNumber);
      }}
    />
  );
});
