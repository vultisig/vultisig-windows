import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReshareVaultIntroStep } from './ReshareVaultIntroStep'

const meta: Meta<typeof ReshareVaultIntroStep> = {
  title: 'Screens/Reshare/ReshareVaultIntroStep',
  component: ReshareVaultIntroStep,
  args: {
    onBack: () => {},
    onStartReshare: () => {},
    onJoinReshare: () => {},
  },
}
export default meta

type Story = StoryObj<typeof ReshareVaultIntroStep>

export const Default: Story = {}
