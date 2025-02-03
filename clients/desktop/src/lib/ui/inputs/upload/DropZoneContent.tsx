import styled from 'styled-components';

import { IconWrapper } from '../../icons/IconWrapper';
import { VStack } from '../../layout/Stack';
import { ChildrenProp, IconProp } from '../../props';
import { Text } from '../../text';
import { getColor } from '../../theme/getters';

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primary')};
  font-size: 60px;
`;

export const DropZoneContent = ({
  children,
  icon,
}: ChildrenProp & IconProp) => {
  return (
    <VStack gap={8} alignItems="center">
      <IconContainer>{icon}</IconContainer>
      <Text color="regular" weight="600" size={14}>
        {children}
      </Text>
    </VStack>
  );
};
