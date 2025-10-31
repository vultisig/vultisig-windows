import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <EmptyWrapper>
      <VStack gap={12} alignItems="center">
        {icon || (
          <IconWrapper size={24} color="buttonHover">
            <CryptoIcon />
          </IconWrapper>
        )}
        <VStack gap={8}>
          <Text centerHorizontally size={15}>
            {title}
          </Text>
          {description && (
            <Text centerHorizontally size={13} color="shy">
              {description}
            </Text>
          )}
        </VStack>
      </VStack>
    </EmptyWrapper>
  )
}

const EmptyWrapper = styled.div`
  ${vStack({
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  })};
  padding: 32px 40px;
  border-radius: 16px;
  background: ${getColor('foreground')};
`
