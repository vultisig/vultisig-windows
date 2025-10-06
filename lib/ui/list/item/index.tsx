import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColors } from '@lib/ui/theme/ThemeColors'
import {
  CSSProperties,
  FC,
  HTMLAttributes,
  isValidElement,
  ReactNode,
} from 'react'
import styled, { css } from 'styled-components'

type Styles = {
  color: ThemeColor
  fontSize: NonNullable<CSSProperties['fontSize']>
}
type Status = 'default' | 'error' | 'success' | 'warning'
type ThemeColor = keyof ThemeColors

const StyledDesc = styled.span<Styles>`
  color: ${({ color }) => getColor(color)};
  font-size: ${({ fontSize }) => toSizeUnit(fontSize)};
  font-weight: 500;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`

const StyledMeta = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  overflow: auto;
`

const StyledTitle = styled.span<Styles>`
  color: ${({ color }) => getColor(color)};
  font-size: ${({ fontSize }) => toSizeUnit(fontSize)};
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
  background-color: ${getColor('foreground')};
  display: flex;
  gap: 8px;
  justify-content: space-between;
  min-height: 58px;
  padding: 12px 16px;
  ${({ status }) => {
    switch (status) {
      case 'error':
        return css`
          color: ${getColor('danger')};
        `
      case 'success':
        return css`
          color: ${getColor('primary')};
        `
      case 'warning':
        return css`
          color: ${getColor('idle')};
        `
      default:
        return css`
          color: ${getColor('text')};
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
          background-color: ${getColor('foregroundExtra')};
        }
      `
    )
  }}
`

type ListItemProps = {
  description?: ReactNode
  extra?: ReactNode
  hoverable?: boolean
  icon?: ReactNode
  showArrow?: boolean
  status?: Status
  styles?: { description?: Partial<Styles>; title?: Partial<Styles> }
  title: ReactNode
} & Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'>

export const ListItem: FC<ListItemProps> = ({
  description,
  extra,
  icon,
  showArrow,
  status = 'default',
  title,
  styles,
  ...rest
}) => {
  const titleRender = isValidElement(title) ? (
    title
  ) : (
    <StyledTitle
      color={styles?.title?.color || 'text'}
      fontSize={styles?.title?.fontSize || 14}
    >
      {title}
    </StyledTitle>
  )

  return (
    <StyledListItem status={status} {...rest}>
      <StyledContent>
        {icon}
        {description ? (
          <StyledMeta>
            {titleRender}
            {isValidElement(description) ? (
              description
            ) : (
              <StyledDesc
                color={styles?.description?.color || 'textShy'}
                fontSize={styles?.description?.fontSize || 12}
              >
                {description}
              </StyledDesc>
            )}
          </StyledMeta>
        ) : (
          titleRender
        )}
      </StyledContent>
      {(extra || showArrow) && (
        <StyledContent>
          {extra}
          {showArrow && <ChevronRightIcon fontSize={16} />}
        </StyledContent>
      )}
    </StyledListItem>
  )
}
