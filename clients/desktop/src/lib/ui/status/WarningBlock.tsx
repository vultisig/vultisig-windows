import React, { ElementType, ReactNode } from 'react';
import styled from 'styled-components';

import { borderRadius } from '../css/borderRadius';
import { IconWrapper } from '../icons/IconWrapper';
import { TriangleAlertIcon } from '../icons/TriangleAlertIcon';
import { hStack } from '../layout/Stack';
import { ChildrenProp, UiProps } from '../props';
import { text } from '../text';
import { getColor } from '../theme/getters';
import { Tooltip } from '../tooltips/Tooltip';

const Container = styled.div`
  ${borderRadius.m};
  border: 1px solid
    ${({ theme }) =>
      theme.colors.idle.getVariant({ a: () => 0.25 }).toCssValue()};
  background: ${getColor('idleDark')};
  padding: 16px;

  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    gap: 12,
  })}
`;

const IconContainer = styled(IconWrapper)`
  color: ${getColor('idle')};
  font-size: 22px;
`;

const Content = styled.div`
  flex: 1;
  ${text({
    color: 'idle',
    centerHorizontally: true,
    weight: '600',
  })}
`;

type WarningBlockProps = {
  icon?: ElementType;
  iconTooltipContent?: ReactNode;
} & ChildrenProp &
  UiProps;

export const WarningBlock = ({
  children,
  iconTooltipContent,
  icon: Icon,
  ...rest
}: WarningBlockProps) => {
  const icon = Icon ? (
    <Icon />
  ) : (
    <IconContainer>
      <TriangleAlertIcon />
    </IconContainer>
  );

  return (
    <Container {...rest}>
      <Content>{children}</Content>
      {iconTooltipContent ? (
        <Tooltip
          content={iconTooltipContent}
          placement="top"
          renderOpener={props => <div {...props}>{icon}</div>}
        />
      ) : (
        icon
      )}
    </Container>
  );
};
