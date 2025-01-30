import { ReactNode, useState } from 'react';
import styled from 'styled-components';

import { Button } from '../buttons/Button';
import { HStack, hStack } from '../layout/Stack';
import { getColor } from '../theme/getters';

type Option<T extends string | number> = {
  label: string;
  value: T;
  icon?: ReactNode;
};

type ToggleSwitchProps<T extends string | number> = {
  options: Option<T>[];
  selected: T;
  onChange?: (value: T) => void;
};

export const ToggleSwitch = <T extends string | number>({
  options,
  selected,
  onChange,
}: ToggleSwitchProps<T>) => {
  const [active, setActive] = useState(selected);

  const handleClick = (value: T) => {
    setActive(value);
    onChange?.(value);
  };

  return (
    <Wrapper>
      {options.map(option => (
        <ToggleButton
          key={option.value}
          active={active === option.value}
          onClick={() => handleClick(option.value)}
        >
          {option.icon}
          {option.label}
        </ToggleButton>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled(HStack)`
  border-radius: 99px;
  background-color: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  padding: 8px;
`;

const ToggleButton = styled(Button)<{
  active: boolean;
}>`
  flex: 1;
  padding: 6px 12px;
  background-color: ${({ active }) =>
    active ? getColor('background') : 'transparent'};
  color: ${getColor('text')};

  &:hover {
    background-color: ${({ active }) =>
      active ? getColor('background') : 'transparent'};
  }

  ${hStack({
    gap: 4,
  })};
`;
