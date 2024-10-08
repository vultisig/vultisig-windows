import styled from 'styled-components';

import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { IconWrapper } from '../icons/IconWrapper';
import { UIComponentProps } from '../props';

type CollapsableStateIndicatorProps = UIComponentProps & {
  isOpen: boolean;
};

const Container = styled(IconWrapper)<{ isOpen: boolean }>`
  transform: rotateZ(${({ isOpen }) => (isOpen ? '-180deg' : '0deg')});
`;

export const CollapsableStateIndicator = (
  props: CollapsableStateIndicatorProps
) => (
  <Container {...props}>
    <ChevronDownIcon />
  </Container>
);
