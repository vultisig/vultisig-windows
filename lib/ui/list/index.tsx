import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes, isValidElement, ReactNode } from 'react'
import styled, { css } from 'styled-components'

const StyledList = styled.div<{ bordered?: boolean }>`
  background-color: ${getColor('borderLight')};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  ${({ bordered }) => {
    return bordered
      ? css`
          border: solid 1px ${getColor('borderLight')};
        `
      : css``
  }}
`

type ListProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick' | 'style'
> & {
  bordered?: boolean
  title?: ReactNode
}

export const List: FC<ListProps> = ({ children, title, ...rest }) => {
  return !title ? (
    <StyledList {...rest}>{children}</StyledList>
  ) : isValidElement(title) ? (
    <VStack gap={12}>
      {title}
      <List>{children}</List>
    </VStack>
  ) : (
    <VStack gap={12}>
      <Text color="light" size={12} weight={500}>
        {title}
      </Text>
      <List>{children}</List>
    </VStack>
  )
}
