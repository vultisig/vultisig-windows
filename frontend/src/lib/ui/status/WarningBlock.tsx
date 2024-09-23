import styled from 'styled-components';

import { borderRadius } from '../css/borderRadius';
import { IconWrapper } from '../icons/IconWrapper';
import { TriangleAlertIcon } from '../icons/TriangleAlertIcon';
import { hStack } from '../layout/Stack';
import { ComponentWithChildrenProps, UIComponentProps } from '../props';
import { text } from '../text';
import { getColor } from '../theme/getters';

const Container = styled.div`
  ${borderRadius.s};
  border: 1px solid ${getColor('idle')};
  background: ${({ theme }) =>
    theme.colors.idle.getVariant({ a: () => 0.35 }).toCssValue()};
  padding: 20px 12px;

  color: ${getColor('contrast')};

  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    gap: 20,
  })}
`;

const IconContainer = styled(IconWrapper)`
  color: ${getColor('idle')};
  font-size: 22px;
`;

const Content = styled.div`
  flex: 1;
  ${text({
    color: 'contrast',
    centerHorizontally: true,
    weight: '600',
  })}
`;

type WarningBlockProps = ComponentWithChildrenProps & UIComponentProps;

export const WarningBlock = ({ children, ...rest }: WarningBlockProps) => {
  return (
    <Container {...rest}>
      <IconContainer>
        <TriangleAlertIcon />
      </IconContainer>
      <Content>{children}</Content>
    </Container>
  );
};
