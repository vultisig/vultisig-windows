import type { Meta, StoryObj } from '@storybook/react-vite'

import { EnableNotificationsPromptSheet } from './EnableNotificationsPromptSheet'
import { EnableNotificationsWelcome } from './EnableNotificationsWelcome'

const meta = {
  title: 'Notifications/EnableNotificationsPromptSheet',
} satisfies Meta

export default meta
type Story = StoryObj

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: 'responsive' },
  },
  render: () => (
    <EnableNotificationsPromptSheet
      onClose={() => {}}
      onDismiss={() => {}}
      onEnable={() => {}}
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
    <EnableNotificationsPromptSheet
      onClose={() => {}}
      onDismiss={() => {}}
      onEnable={() => {}}
    />
  ),
}

export const WelcomeWrapper: Story = {
  render: () => (
    <EnableNotificationsWelcome onDismiss={() => {}} onEnable={() => {}} />
  ),
}
