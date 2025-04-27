import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css, useTheme } from 'styled-components'

type Status = 'default' | 'error' | 'success' | 'warning'

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

const StyledTitle = styled.span<{ status?: Status }>`
  flex: 1;
  font-size: ${14};
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
`

const StyledListItem = styled.div<{
  hoverable?: boolean
}>`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  display: flex;
  gap: 8px;
  min-height: 58px;
  padding: 12px 16px;
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
  const { colors } = useTheme()
  let arrowColor: string

  switch (status) {
    case 'error':
      arrowColor = colors.alertError.toHex()
      break
    case 'success':
      arrowColor = colors.alertSuccess.toHex()
      break
    case 'warning':
      arrowColor = colors.alertWarning.toHex()
      break
    default:
      arrowColor = colors.textPrimary.toHex()
      break
  }

  return (
    <StyledListItem {...rest}>
      {icon && icon}
      {description ? (
        <StyledMeta>
          <StyledTitle status={status}>{title}</StyledTitle>
          <StyledDesc>{description}</StyledDesc>
        </StyledMeta>
      ) : (
        <StyledTitle status={status}>{title}</StyledTitle>
      )}
      {extra && extra}
      {showArrow && <ChevronRightIcon fontSize={16} stroke={arrowColor} />}
    </StyledListItem>
  )
}
