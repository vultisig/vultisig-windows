import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationSettingsPage } from './NotificationSettingsPage'

const meta: Meta<typeof NotificationSettingsPage> = {
  title: 'Notifications/NotificationSettingsPage',
  component: NotificationSettingsPage,
}

export default meta

type Story = StoryObj<typeof NotificationSettingsPage>

export const Default: Story = {}
