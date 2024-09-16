import styled from 'styled-components';

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { HStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { ClickableComponentProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';

type VaultListOptionProps = ClickableComponentProps & {
  name: string;
};

const Container = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
`;

export const VaultListOption = ({ name, onClick }: VaultListOptionProps) => {
  return (
    <UnstyledButton onClick={onClick}>
      <Container>
        <HStack fullWidth alignItems="center" justifyContent="space-between">
          <Text>{name}</Text>
          <ChevronRightIcon />
        </HStack>
      </Container>
    </UnstyledButton>
  );
};
