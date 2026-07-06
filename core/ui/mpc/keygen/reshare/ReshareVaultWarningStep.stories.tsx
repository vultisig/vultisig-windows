import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReshareVaultWarningStep } from './ReshareVaultWarningStep'

const meta: Meta<typeof ReshareVaultWarningStep> = {
  title: 'Screens/Reshare/ReshareVaultWarningStep',
  component: ReshareVaultWarningStep,
  args: {
    onBack: () => {},
    onConfirm: () => {},
  },
}
export default meta

type Story = StoryObj<typeof ReshareVaultWarningStep>

export const Default: Story = {}
