import styled, { css } from 'styled-components';

import { DnDItemStatus } from '../../../dnd/DnDItemStatus';
import { match } from '../../../utils/match';
import { absoluteOutline } from '../../css/absoluteOutline';
import { borderRadius } from '../../css/borderRadius';
import { ComponentWithStatusProps } from '../../props';
import { getColor } from '../../theme/getters';

export const DnDItemHighlight = styled.div`
  position: absolute;
  ${borderRadius.m};
  ${absoluteOutline(0, 0)}

  border: 2px solid ${getColor('primary')};
`;

export const DnDItemContainer = styled.div<
  ComponentWithStatusProps<DnDItemStatus>
>`
  position: relative;
  ${({ status }) =>
    match(status, {
      idle: () => css``,
      overlay: () => css`
        cursor: grabbing;
      `,
      placeholder: () => css`
        opacity: 0.4;
      `,
    })}
`;
