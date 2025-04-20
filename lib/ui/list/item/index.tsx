import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { getColor } from '@lib/ui/theme/getters'
import { rem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes, JSX } from 'react'
import styled, { css } from 'styled-components'

const StyledDesc = styled.span`
  color: ${getColor('textExtraLight')};
  flex: 1;
  font-size: ${rem(12)};
  font-weight: 500;
  line-height: ${rem(16)};
`

const StyledMeta = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${rem(4)};
`

const StyledTitle = styled.span`
  color: ${getColor('textPrimary')};
  flex: 1;
  font-size: ${14};
  font-weight: 500;
  line-height: ${rem(20)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const StyledListItem = styled.div<{
  hoverable?: boolean
}>`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  display: flex;
  gap: ${rem(8)};
  padding: ${rem(12)} ${rem(16)};
  ${({ hoverable }) => {
    return hoverable
      ? css`
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: ${getColor('backgroundTertiary')};
          }
        `
      : css``
  }}
`

interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  description?: string
  extra?: JSX.Element
  hoverable?: boolean
  icon?: JSX.Element
  showArrow?: boolean
  title: string
}

export const ListItem: FC<ListItemProps> = ({
  description,
  extra,
  icon,
  showArrow,
  title,
  ...rest
}) => {
  return (
    <StyledListItem {...rest}>
      {icon && icon}
      {description ? (
        <StyledMeta>
          <StyledTitle>{title}</StyledTitle>
          <StyledDesc>{description}</StyledDesc>
        </StyledMeta>
      ) : (
        <StyledTitle>{title}</StyledTitle>
      )}
      {extra && extra}
      {showArrow && <ChevronRightIcon size={16} />}
    </StyledListItem>
  )
}
