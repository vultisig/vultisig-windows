import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

export const BondCard = styled(Panel)`
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
`

export const BondSectionHeader = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const BondSectionTitle = styled(Text)`
  text-transform: capitalize;
`

export const BondValueRow = styled(VStack)`
  gap: 4px;
`

export const BondButtonRow = styled(HStack)`
  gap: 12px;
  flex-wrap: wrap;
`

export const BondStatusPill = styled.div<{
  tone?: 'success' | 'warning' | 'neutral'
}>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  ${({ tone }) =>
    tone === 'success'
      ? css`
          color: ${getColor('success')};
          background: rgba(0, 200, 120, 0.12);
        `
      : tone === 'warning'
        ? css`
            color: ${getColor('primary')};
            background: rgba(255, 184, 0, 0.12);
          `
        : css`
            color: ${getColor('contrast')};
            background: ${getColor('foregroundExtra')};
          `}
`
