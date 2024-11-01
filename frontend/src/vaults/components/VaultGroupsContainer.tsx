import styled from 'styled-components';

import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { vStack } from '../../lib/ui/layout/Stack';
import { ComponentWithChildrenProps } from '../../lib/ui/props';

const Content = styled.div`
  ${vStack({
    flexGrow: true,
    gap: 20,
  })}
`;

export const VaultGroupsContainer = ({
  children,
}: ComponentWithChildrenProps) => (
  <ScrollableFlexboxFiller>
    <Content>{children}</Content>
  </ScrollableFlexboxFiller>
);
