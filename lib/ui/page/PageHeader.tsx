import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { HStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isValidElement, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { UiProps } from '../props'

const StyledPageHeader = styled(HStack)<{
  hasBorder?: boolean
}>`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  min-height: 60px;
  position: relative;

  ${({ hasBorder }) =>
    hasBorder &&
    css`
      border-bottom: 1px solid ${getColor('foregroundExtra')};
    `};
`

const StyledPrimaryControls = styled(HStack)`
  left: ${pageConfig.horizontalPadding}px;
  position: absolute;
`

const StyledSecondaryControls = styled(HStack)`
  position: absolute;
  right: ${pageConfig.horizontalPadding}px;
`

const StyledTitle = styled(Text)`
  max-width: 60%;
`

type PageHeaderProps = {
  hasBorder?: boolean
  primaryControls?: ReactNode
  secondaryControls?: ReactNode
  title?: ReactNode
} & UiProps

export const PageHeader = ({
  hasBorder = false,
  primaryControls,
  secondaryControls,
  title,
  ...rest
}: PageHeaderProps) => {
  return (
    <StyledPageHeader
      alignItems="center"
      hasBorder={hasBorder}
      justifyContent="center"
      {...rest}
    >
      {primaryControls && (
        <StyledPrimaryControls gap={8}>{primaryControls}</StyledPrimaryControls>
      )}
      {secondaryControls && (
        <StyledSecondaryControls gap={8}>
          {secondaryControls}
        </StyledSecondaryControls>
      )}
      {isValidElement(title) ? (
        title
      ) : (
        <StyledTitle as="span" size={18} weight={500} cropped>
          {title}
        </StyledTitle>
      )}
    </StyledPageHeader>
  )
}
