import styled, { css } from 'styled-components';

import { borderRadius } from '../../css/borderRadius';
import { horizontalPadding } from '../../css/horizontalPadding';
import { interactive } from '../../css/interactive';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { HStack, hStack } from '../../layout/Stack';
import { ClickableComponentProps, TitledComponentProps } from '../../props';
import { text } from '../../text';
import { getHoverVariant } from '../../theme/getHoverVariant';
import { getColor } from '../../theme/getters';
import { DnDItemContentPrefix } from './DnDItemContentPrefix';

const Container = styled.div<{ isInteractive: boolean }>`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  height: 48px;
  background: ${getColor('foreground')};
  ${borderRadius.m};
  ${horizontalPadding(12)}

  ${hStack({
    alignItems: 'center',
  })}

  ${text({
    weight: 700,
    color: 'contrast',
    size: 16,
  })}

  ${({ isInteractive }) =>
    isInteractive &&
    css`
      ${interactive};
      &:hover {
        background: ${getHoverVariant('foreground')};
      }
    `}
`;

type ListItemProps = {
  isDraggable?: boolean;
} & TitledComponentProps &
  Partial<ClickableComponentProps>;

export const ListItem = ({ title, onClick, isDraggable }: ListItemProps) => {
  return (
    <Container isInteractive={!!onClick} onClick={onClick}>
      <HStack fullWidth alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={12}>
          {isDraggable && <DnDItemContentPrefix />}
          {title}
        </HStack>
        {onClick && <ChevronRightIcon />}
      </HStack>
    </Container>
  );
};
