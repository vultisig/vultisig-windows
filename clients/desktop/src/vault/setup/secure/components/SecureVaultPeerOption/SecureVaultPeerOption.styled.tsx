import styled from 'styled-components';
import { css } from 'styled-components';

import { HStack, hStack } from '../../../../../lib/ui/layout/Stack';
import { Text } from '../../../../../lib/ui/text';
import { getColor } from '../../../../../lib/ui/theme/getters';

export const Wrapper = styled(HStack)<{
  isActive: boolean;
  isCurrentDevice: boolean;
}>`
  padding: 16px;
  border-radius: 16px;
  width: 150px;

  ${({ isCurrentDevice, isActive }) =>
    isCurrentDevice || isActive
      ? css`
          cursor: initial;
          background: #042436;
          border: 1px solid
            ${isActive ? getColor('primary') : 'rgba(19, 200, 157, 0.25)'};
        `
      : css`
          border: 1px dashed ${getColor('foregroundSuper')};
        `}
`;

export const RiveWrapper = styled.div`
  flex-shrink: 0;
  height: 24px;
  width: 24px;
`;

export const CheckIconWrapper = styled.div`
  ${hStack()}
  align-items: center;
  justify-content: center;
  padding: 1px;
  background-color: ${getColor('primary')};
  border-radius: 50%;
  font-size: 24px;
`;

export const StyledText = styled(Text)`
  word-break: break-all;
`;
