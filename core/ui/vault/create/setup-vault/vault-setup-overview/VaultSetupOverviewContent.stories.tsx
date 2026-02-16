import type { Meta, StoryObj } from '@storybook/react-vite'

import { VaultSetupOverviewContent } from './VaultSetupOverviewContent'

const meta: Meta<typeof VaultSetupOverviewContent> = {
  title: 'Screens/VaultSetupOverviewContent',
  component: VaultSetupOverviewContent,
  args: {
    onBack: () => {},
    onGetStarted: () => {},
  },
}
export default meta

type Story = StoryObj<typeof VaultSetupOverviewContent>

export const FastVault: Story = {
  args: { selectedDeviceCount: 0 },
}

export const Secure2Device: Story = {
  args: { selectedDeviceCount: 1 },
}

export const Secure3Device: Story = {
  args: { selectedDeviceCount: 2 },
}

export const Secure4PlusDevice: Story = {
  args: { selectedDeviceCount: 3 },
}
