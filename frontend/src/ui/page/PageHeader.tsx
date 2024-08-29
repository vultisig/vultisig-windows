import { ComponentProps, ReactNode } from 'react';
import styled from 'styled-components';
import { centerContent } from '../../lib/ui/css/centerContent';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { pageConfig } from './config';
import { TakeWholeSpace } from '../../lib/ui/css/takeWholeSpace';

const Container = styled.div`
  ${centerContent};
  width: 100%;
  height: 60px;
  ${horizontalPadding(pageConfig.horizontalPadding)};
`;

const Content = styled(TakeWholeSpace)`
  position: relative;
  ${centerContent};
`;

type PageHeaderProps = Omit<ComponentProps<typeof Container>, 'title'> & {
  title: ReactNode;
  primaryControls?: ReactNode;
  secondaryControls?: ReactNode;
};

const ControlsContainer = styled.div`
  position: absolute;
`;

export const PageHeader = ({
  title,
  primaryControls,
  secondaryControls,
  ...rest
}: PageHeaderProps) => {
  return (
    <Container {...rest}>
      <Content>
        <ControlsContainer style={{ left: 0 }}>
          {primaryControls}
        </ControlsContainer>
        {title}
        <ControlsContainer style={{ right: 0 }}>
          {secondaryControls}
        </ControlsContainer>
      </Content>
    </Container>
  );
};
