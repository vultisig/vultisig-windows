import styled from 'styled-components';

import { QUERIES } from '../../../../../lib/ui/constants';
import { Text } from '../../../../../lib/ui/text';

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 32px;
`;

export const CenteredBox = styled.div`
  position: fixed;
  inset: 0;
  margin: auto;
  width: 350px;
  height: 350px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ResponsiveText = styled(Text)`
  font-size: 18px;

  @media (${QUERIES.desktopAndUp}) {
    font-size: 22px;
  }
`;

export const ResponsiveImage = styled.img`
  width: 120px;
  height: 120px;

  @media (${QUERIES.desktopAndUp}) {
    width: 150px;
    height: 150px;
  }
`;
