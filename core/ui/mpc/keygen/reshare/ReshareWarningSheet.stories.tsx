import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReshareVaultIntroStep } from './ReshareVaultIntroStep'
import { ReshareWarningSheet } from './ReshareWarningSheet'

const noop = () => {}

const meta: Meta<typeof ReshareWarningSheet> = {
  title: 'Screens/Reshare/ReshareWarningSheet',
  component: ReshareWarningSheet,
  args: {
    onClose: noop,
    onConfirm: noop,
  },
  decorators: [
    Story => (
      <div style={{ height: '100vh' }}>
        <ReshareVaultIntroStep
          onBack={noop}
          onStartReshare={noop}
          onJoinReshare={noop}
        />
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ReshareWarningSheet>

export const OverLanding: Story = {}
