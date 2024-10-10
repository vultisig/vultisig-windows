import styled from 'styled-components';

import { Hoverable } from '../base/Hoverable';
import { centerContent } from '../css/centerContent';
import { sameDimensions } from '../css/sameDimensions';
import { CloseIcon } from '../icons/CloseIcon';
import { ClickableComponentProps } from '../props';
import { getColor } from '../theme/getters';

const IconWrapper = styled.div`
  font-size: 20px;
  ${sameDimensions(24)};
  ${centerContent};
`;

const Container = styled(Hoverable)`
  color: ${getColor('contrast')};
  &:hover ${IconWrapper} {
    color: ${getColor('contrast')};
  }
`;

export const ModalCloseButton = ({ onClick }: ClickableComponentProps) => {
  return (
    <Container onClick={onClick}>
      <IconWrapper>
        <CloseIcon />
      </IconWrapper>
    </Container>
  );
};