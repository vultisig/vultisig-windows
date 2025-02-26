import styled from 'styled-components/native';
import { PageContent } from '~/lib/ui/components/PageContent';
import { getColor } from '~/lib/ui/utils';
export const Wrapper = styled(PageContent) `
  justify-content: center;
  align-items: center;
  background-color: ${getColor('foreground')};
  padding: 24px;
  padding-bottom: 58px;
`;
export const HorizontalDecorationLine = styled.View `
  height: 1px;
  background-color: ${getColor('foregroundExtra')};
  flex: 1;
`;
