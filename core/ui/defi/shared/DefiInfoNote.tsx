import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

/** Rounded informational banner (info icon + text) used in DeFi forms. */
export const DefiInfoNote = ({ children }: { children: ReactNode }) => (
  <Container gap={12} alignItems="center">
    <IconWrapper size={18} color="textShy">
      <InfoIcon />
    </IconWrapper>
    <Text size={13} color="shy">
      {children}
    </Text>
  </Container>
)

const Container = styled(HStack)`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`
