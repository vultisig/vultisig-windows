import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

type Status = 'default' | 'error' | 'info' | 'success' | 'warning'

const StyledListItemTag = styled.span<{ status: Status }>`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid 1px ${getColor('borderLight')};
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
          color: ${getColor('alertError')};
        `
      case 'info':
        return css`
          color: ${getColor('alertInfo')};
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

interface ListItemTagProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'> {
  status?: Status
  title: string
}

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
