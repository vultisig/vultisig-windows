import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes, JSX } from 'react'
import styled, { css } from 'styled-components'

const StyledDesc = styled.span`
  color: ${({ theme }) => theme.colors.textExtraLight.toHex()};
  flex: 1;
  font-size: ${pxToRem(12)};
  font-weight: 500;
  line-height: ${pxToRem(16)};
`

const StyledMeta = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${pxToRem(4)};
`

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary.toHex()};
  flex: 1;
  font-size: ${14};
  font-weight: 500;
  line-height: ${pxToRem(20)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const StyledListItem = styled.div<{
  hoverable?: boolean
}>`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundsSecondary.toHex()};
  display: flex;
  gap: ${pxToRem(8)};
  padding: ${pxToRem(12)} ${pxToRem(16)};
  ${({ hoverable }) => {
    return hoverable
      ? css`
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: ${({ theme }) =>
              theme.colors.backgroundTertiary.toHex()};
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
