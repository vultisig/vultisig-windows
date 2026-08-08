import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import styled from 'styled-components'

import { CoreProvider, CoreState } from '../../../state/core'
import { BlockaidOverlay } from './BlockaidOverlay'

const meta = {
  title: 'Chain/Security/BlockaidOverlay',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj

const coreState = {
  goBack: () => {},
} as CoreState

const VerifySurface = styled(VStack)`
  min-height: 100vh;
  padding: 24px;
`

const ReviewCard = styled(VStack)`
  width: min(100%, 420px);
  margin: 0 auto;
  padding: 20px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.foreground.toCssValue()};
`

const WarningDescription =
  'Interacts with a contract that has elevated risk signals on recent routes.'

export const MediumRiskSheet: Story = {
  render: () => (
    <CoreProvider value={coreState}>
      <VerifySurface gap={16}>
        <ReviewCard gap={20}>
          <VStack gap={8}>
            <Text color="supporting" size={12}>
              Verify transaction
            </Text>
            <Text color="regular" size={22}>
              Swap 0.42 ETH to USDC
            </Text>
          </VStack>
          <VStack gap={8}>
            <Text color="supporting" size={14}>
              Network
            </Text>
            <Text color="regular" size={16}>
              Ethereum
            </Text>
          </VStack>
          <VStack gap={8}>
            <Text color="supporting" size={14}>
              Recipient
            </Text>
            <Text color="regular" size={16}>
              0xA51...9F02
            </Text>
          </VStack>
          <Button>Start keysign</Button>
        </ReviewCard>
        <BlockaidOverlay
          riskLevel="medium"
          description={WarningDescription}
          title="Medium risk transaction detected"
        />
      </VerifySurface>
    </CoreProvider>
  ),
}

export const HighRiskModal: Story = {
  render: () => (
    <CoreProvider value={coreState}>
      <VerifySurface gap={16}>
        <ReviewCard gap={20}>
          <Text color="regular" size={22}>
            Verify transaction
          </Text>
          <Text color="supporting" size={14}>
            High-risk results keep the blocking modal treatment.
          </Text>
        </ReviewCard>
        <BlockaidOverlay
          riskLevel="high"
          description="This transaction involves a malicious address."
          title="High risk transaction detected"
        />
      </VerifySurface>
    </CoreProvider>
  ),
}
