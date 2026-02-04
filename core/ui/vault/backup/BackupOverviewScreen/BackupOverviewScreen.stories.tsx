import type { Meta, StoryObj } from '@storybook/react-vite'

import { BackupOverviewScreen } from '.'

const meta: Meta<typeof BackupOverviewScreen> = {
  title: 'Screens/BackupOverviewScreen',
  component: BackupOverviewScreen,
  args: {
    onFinish: () => {},
  },
}
export default meta

type Story = StoryObj<typeof BackupOverviewScreen>

export const OneDevice: Story = {
  args: { userDeviceCount: 1 },
}

export const TwoDevices: Story = {
  args: { userDeviceCount: 2 },
}

export const ThreeDevices: Story = {
  args: { userDeviceCount: 3 },
}

export const FourDevices: Story = {
  args: { userDeviceCount: 4 },
}
