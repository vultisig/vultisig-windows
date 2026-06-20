import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { SwapExternalRecipientWarning } from './SwapExternalRecipientWarning'

const sampleAddress = '0x0bd442356896e0cdfC436237e6b92a9A7feF3Fe6'

const meta: Meta<typeof SwapExternalRecipientWarning> = {
  title: 'Vault/Swap/SwapExternalRecipientWarning',
  component: SwapExternalRecipientWarning,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    address: sampleAddress,
  },
  argTypes: {
    kind: {
      control: 'inline-radio',
      options: ['warning', 'danger'],
    },
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Warning: Story = {
  name: 'Warning (amber)',
  args: { kind: 'warning' },
}

export const Danger: Story = {
  name: 'Danger (red)',
  args: { kind: 'danger' },
}

export const Comparison: Story = {
  name: 'Side by side',
  render: args => (
    <VStack gap={16} style={{ maxWidth: 420 }}>
      <Text color="shy" size={13}>
        warning (amber) — matches WarningBlock
      </Text>
      <SwapExternalRecipientWarning {...args} kind="warning" />
      <Text color="shy" size={13}>
        danger (red) — matches ErrorBlock
      </Text>
      <SwapExternalRecipientWarning {...args} kind="danger" />
    </VStack>
  ),
}
