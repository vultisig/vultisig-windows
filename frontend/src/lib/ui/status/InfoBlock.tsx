import styled from 'styled-components';

import { borderRadius } from '../css/borderRadius';
import { IconWrapper } from '../icons/IconWrapper';
import { InfoIconWithGradient } from '../icons/InfoIconWithGradient';
import { hStack } from '../layout/Stack';
import { ChildrenProp, UiProps } from '../props';
import { text } from '../text';
import { getColor } from '../theme/getters';

const Container = styled.div`
  ${borderRadius.s};
  border: 1px solid ${getColor('primary')};
  padding: 20px 12px;

  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    gap: 20,
  })}
`;

const IconContainer = styled(IconWrapper)`
  font-size: 22px;
`;

const Content = styled.div`
  flex: 1;
  ${text({
    color: 'contrast',
    weight: '400',
    family: 'mono',
    size: 14,
  })}
`;

type WarningBlockProps = ChildrenProp & UiProps;

export const InfoBlock = ({ children, ...rest }: WarningBlockProps) => {
  return (
    <Container {...rest}>
      <IconContainer>
        <InfoIconWithGradient />
      </IconContainer>
      <Content>{children}</Content>
    </Container>
  );
};
