import { ComponentProps, ReactNode } from 'react';
import styled from 'styled-components';
import { Hoverable } from '../../lib/ui/base/Hoverable';
import { getColor } from '../../lib/ui/theme/getters';
import { IconWrapper } from '../../lib/ui/icons/IconWrapper';
import { pageConfig } from './config';

const Container = styled(Hoverable)`
  font-size: 20px;
  color: ${getColor('contrast')};
`;

type PageHeaderIconButtonProps = ComponentProps<typeof Container> & {
  icon: ReactNode;
};

const offset = pageConfig.header.iconButton.offset;

export const PageHeaderIconButton = ({
  icon,
  ...rest
}: PageHeaderIconButtonProps) => {
  return (
    <Container verticalOffset={offset} horizontalOffset={offset} {...rest}>
      <IconWrapper>{icon}</IconWrapper>
    </Container>
  );
};