import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

const StyledDesc = styled.span`
  color: ${getColor('textExtraLight')};
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`

const StyledMeta = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`

const StyledTitle = styled.span`
  color: ${getColor('textPrimary')};
  flex: 1;
  font-size: ${14};
  font-weight: 500;
  line-height: 20px;
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
  gap: 8px;
  padding: 12px 16px;
  ${({ hoverable }) => {
    return hoverable
      ? css`
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: ${getColor('backgroundTertiary')};
        `
      : css``
  }}
`

interface ListItemProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'> {
  description?: ReactNode
  extra?: ReactNode
  hoverable?: boolean
  icon?: ReactNode
  showArrow?: boolean
  title: ReactNode
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
