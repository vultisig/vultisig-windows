import styled from 'styled-components';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { panel } from '../../../lib/ui/panel/Panel';
import {
  ClickableComponentProps,
  ComponentWithActiveState,
  ComponentWithValueProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { getColor, matchColor } from '../../../lib/ui/theme/getters';

const Container = styled(UnstyledButton)<ComponentWithActiveState>`
  ${panel()};

  position: relative;

  border: 2px solid
    ${matchColor('isActive', { true: 'primary', false: 'transparent' })};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`;

export const DepositActionOption = ({
  value,
  onClick,
  isActive,
}: ComponentWithValueProps<string> &
  ClickableComponentProps &
  ComponentWithActiveState) => {
  return (
    <Container isActive={isActive} onClick={onClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <VStack alignItems="start">
          <Text color="contrast" size={20} weight="700">
            {value}
          </Text>
        </VStack>
      </HStack>
    </Container>
  );
};
