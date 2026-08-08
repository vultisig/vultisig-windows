import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { FileWarningIcon } from '@lib/ui/icons/FileWarningIcon'
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

export const Reshare: Story = {
  args: {
    userDeviceCount: 2,
    infoRows: [
      {
        id: 'backup-each-device',
        icon: <CloudUploadIcon style={{ fontSize: 24 }} />,
        title: 'Back up each device',
        description:
          'This is only 1 backup of your vault, repeat this process for the other devices.',
      },
      {
        id: 'store-backups-separately',
        icon: <ArrowSplitIcon style={{ fontSize: 24 }} />,
        title: 'Store backups separately',
        description:
          'Keep each backup in a different place. If one is compromised, your funds stay safe.',
      },
      {
        id: 'old-backups-wont-work',
        icon: <FileWarningIcon style={{ fontSize: 24 }} />,
        title: "Old backups won't work",
        description:
          "Backups from previous vault setups can't be used. Only backups created during this setup are valid.",
      },
    ],
  },
}
