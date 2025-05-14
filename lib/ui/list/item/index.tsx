import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type Status = 'default' | 'error' | 'success' | 'warning'

const StyledDesc = styled.span`
  color: ${getColor('textExtraLight')};
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`

const StyledMeta = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
`

const StyledTitle = styled.span`
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
  status: Status
}>`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  display: flex;
  gap: 8px;
  min-height: 58px;
  padding: 12px 16px;
  ${({ status }) => {
    switch (status) {
      case 'error':
        return css`
          color: ${getColor('alertError')};
        `
      case 'success':
        return css`
          color: ${getColor('alertSuccess')};
        `
      case 'warning':
        return css`
          color: ${getColor('alertWarning')};
        `
      default:
        return css`
          color: ${getColor('textPrimary')};
        `
    }
  }}
  ${({ hoverable }) => {
    return (
      hoverable &&
      css`
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: ${getColor('backgroundTertiary')};
        }
      `
    )
  }}
`

interface ListItemProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'> {
  description?: ReactNode
  extra?: ReactNode
  hoverable?: boolean
  icon?: ReactNode
  showArrow?: boolean
  status?: Status
  title: ReactNode
}

export const ListItem: FC<ListItemProps> = ({
  description,
  extra,
  icon,
  showArrow,
  status = 'default',
  title,
  ...rest
}) => {
  return (
    <StyledListItem status={status} {...rest}>
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
      {showArrow && <ChevronRightIcon fontSize={16} />}
    </StyledListItem>
  )
}
