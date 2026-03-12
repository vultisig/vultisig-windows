import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type VaultSetupBadgeProps = {
  icon: ReactNode
  title: string
  subtitle: string
}

export const VaultSetupBadge = ({
  icon,
  title,
  subtitle,
}: VaultSetupBadgeProps) => (
  <Container alignItems="center" gap={8}>
    <IconWrapper>{icon}</IconWrapper>
    <VStack gap={2}>
      <Text size={15} weight={500} color="contrast">
        {title}
      </Text>
      <Text size={12} weight={500} color="shy">
        {subtitle}
      </Text>
    </VStack>
  </Container>
)

const Container = styled(HStack)`
  background: #061b3a;
  border: 1px solid ${getColor('foreground')};
  border-radius: 16px;
  padding: 8px 20px 8px 8px;
  align-self: flex-start;
`

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 33px;
  height: 33px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(72, 121, 253, 0.3) 0%,
    rgba(2, 18, 43, 0.8) 100%
  );
  box-shadow:
    0px 22px 34px 0px rgba(0, 0, 0, 0.2),
    0px 9px 14px 0px rgba(0, 0, 0, 0.14),
    0px 5px 8px 0px rgba(0, 0, 0, 0.12);
  color: ${getColor('primary')};
  font-size: 18px;
`
