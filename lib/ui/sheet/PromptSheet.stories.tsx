import { Button } from '@lib/ui/buttons/Button'
import { AgentIcon } from '@lib/ui/icons/AgentIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PromptSheet, PromptSheetIcon } from './PromptSheet'

const meta = {
  title: 'Overlays/PromptSheet',
} satisfies Meta

export default meta
type Story = StoryObj

const icon = (
  <PromptSheetIcon>
    <AgentIcon style={{ fontSize: 24, color: '#2155DF' }} />
  </PromptSheetIcon>
)

const title = (
  <Text variant="title3" color="regular" centerHorizontally>
    Re-authorize Vulti Agent
  </Text>
)

const description = (
  <Text
    size={14}
    weight={500}
    height={20 / 14}
    color="shy"
    centerHorizontally
    style={{ whiteSpace: 'pre-wrap' }}
  >
    {
      'For security, authorization expires periodically.\nPlease confirm to continue using Vulti Agent.'
    }
  </Text>
)

const actions = (
  <HStack gap={12} fullWidth>
    <Button kind="secondary" onClick={() => {}}>
      Cancel
    </Button>
    <Button onClick={() => {}}>Authorize</Button>
  </HStack>
)

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: 'responsive' },
  },
  render: () => (
    <PromptSheet
      icon={icon}
      title={title}
      description={description}
      actions={actions}
      onClose={() => {}}
    />
  ),
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <PromptSheet
      icon={icon}
      title={title}
      description={description}
      actions={actions}
      onClose={() => {}}
    />
  ),
}
