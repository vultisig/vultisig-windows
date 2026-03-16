import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { SaveBackupToCloudScreen } from './SaveBackupToCloudScreen'

const meta: Meta<typeof SaveBackupToCloudScreen> = {
  title: 'Screens/SaveBackupToCloudScreen',
  component: SaveBackupToCloudScreen,
  args: {
    onContinue: () => {},
  },
}
export default meta

type Story = StoryObj<typeof SaveBackupToCloudScreen>

export const FastVault: Story = {}

export const SecureVault: Story = {
  args: {
    title: 'Save backup 1 of 2 to the cloud',
    description: (
      <Text size={14} weight={500} color="shy" centerHorizontally>
        Export this backup file, then save it to the cloud.{' '}
        <Text as="span" color="shyExtra">
          Use a different cloud service or account for each backup. When
          you&apos;re finished, delete the file from this device.
        </Text>
      </Text>
    ),
  },
}

export const Loading: Story = {
  args: {
    ctaLoading: true,
  },
}
