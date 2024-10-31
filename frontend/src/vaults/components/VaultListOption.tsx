import styled from 'styled-components';

import { borderRadius } from '../../lib/ui/css/borderRadius';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { HStack, hStack } from '../../lib/ui/layout/Stack';
import { TitledComponentProps } from '../../lib/ui/props';
import { text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';

const Container = styled.div`
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
`;

export const VaultListOption = ({ title }: TitledComponentProps) => {
  return (
    <Container>
      <HStack fullWidth alignItems="center" justifyContent="space-between">
        {title}
        <ChevronRightIcon />
      </HStack>
    </Container>
  );
};
