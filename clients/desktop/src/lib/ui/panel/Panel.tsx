import { borderRadius } from '@lib/ui/css/borderRadius'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

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
