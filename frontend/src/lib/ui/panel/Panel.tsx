import styled, { css } from 'styled-components';

import { getColor } from '../theme/getters';
import { borderRadius } from '../css/borderRadius';
import { toSizeUnit } from '../css/toSizeUnit';

type PanelProps = {
  withSections?: boolean;
};

export const panelPaddingInPx = 12;

export const panelPadding = css`
  padding: ${toSizeUnit(panelPaddingInPx)};
`;

export const panelBackground = css`
  background: ${getColor('foreground')};
`;

export const Panel = styled.div<PanelProps>`
  ${borderRadius.m};

  ${({ withSections }) =>
    withSections
      ? css`
          background: ${getColor('mistExtra')};
          display: flex;
          flex-direction: column;
          gap: 1px;

          > * {
            ${panelPadding}
            ${panelBackground};
          }
        `
      : css`
          ${panelPadding};
          ${panelBackground};
        `}
`;
