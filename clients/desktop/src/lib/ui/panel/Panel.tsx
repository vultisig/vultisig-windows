import styled, { css } from 'styled-components'

import { borderRadius } from '../css/borderRadius'
import { toSizeUnit } from '../css/toSizeUnit'
import { getColor } from '../theme/getters'

type PanelProps = {
  withSections?: boolean
}

const panelPaddingInPx = 16

const panelPadding = css`
  padding: ${toSizeUnit(panelPaddingInPx)};
`

const panelBackground = css`
  background: ${getColor('foreground')};
`

export const panel = ({ withSections }: PanelProps = {}) => css`
  ${borderRadius.m};

  ${withSections
    ? css`
        background: ${getColor('mistExtra')};
        display: flex;
        flex-direction: column;
        gap: 1px;
        overflow: hidden;

        > * {
          ${panelPadding}
          ${panelBackground};
        }
      `
    : css`
        ${panelPadding};
        ${panelBackground};
      `}
`

export const Panel = styled.div<PanelProps>`
  ${panel};
`
