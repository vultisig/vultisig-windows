import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

type Status = 'default' | 'error' | 'info' | 'success' | 'warning'

const StyledListItemTag = styled.span<{ status: Status }>`
  align-items: center;
  background-color: ${getColor('foreground')};
  border: solid 1px ${getColor('foregroundExtra')};
  border-radius: 20px;
  display: flex;
  font-size: 13px;
  font-weight: 500;
  height: 34px;
  padding: 0 12px;

  ${({ status }) => {
    switch (status) {
      case 'error':
        return css`
          color: ${getColor('danger')};
        `
      case 'info':
        return css`
          color: ${getColor('primaryAlt')};
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
`

type ListItemTagProps = {
  status?: Status
  title: string
} & Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'>

export const ListItemTag: FC<ListItemTagProps> = ({
  status = 'default',
  title,
  ...rest
}) => {
  return (
    <StyledListItemTag status={status} {...rest}>
      {title}
    </StyledListItemTag>
  )
}
