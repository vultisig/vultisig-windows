import styled, { css } from 'styled-components';

import { borderRadius } from '../../css/borderRadius';
import { horizontalPadding } from '../../css/horizontalPadding';
import { interactive } from '../../css/interactive';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { HStack, hStack } from '../../layout/Stack';
import { ChildrenProp, OnClickProp } from '../../props';
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

const Content = styled.div`
  ${hStack({
    flexGrow: true,
    alignItems: 'center',
    gap: 12,
  })}
  overflow: hidden;
`;

type ListItemProps = {
  isDraggable?: boolean;
} & ChildrenProp &
  Partial<OnClickProp>;

export const ListItem = ({ children, onClick, isDraggable }: ListItemProps) => {
  return (
    <Container isInteractive={!!onClick} onClick={onClick}>
      <HStack
        gap={20}
        flexGrow
        alignItems="center"
        justifyContent="space-between"
      >
        <Content>
          {isDraggable && <DnDItemContentPrefix />}
          {children}
        </Content>
        <HStack style={{ flexShrink: 0 }}>
          {onClick && <ChevronRightIcon />}
        </HStack>
      </HStack>
    </Container>
  );
};
