import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationSettingsContent } from './NotificationSettingsContent'

const meta = {
  title: 'Notifications/NotificationSettingsContent',
} satisfies Meta

export default meta

type Story = StoryObj

import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

type VaultNotificationItem = {
  id: string
  name: string
  type: VaultSecurityType
  enabled: boolean
}

const mockVaults: VaultNotificationItem[] = [
  { id: '1', name: 'Secure Vault', type: 'secure', enabled: true },
  { id: '2', name: 'Trading Vault', type: 'fast', enabled: true },
  { id: '3', name: 'Main Vault', type: 'secure', enabled: true },
]

export const Collapsed: Story = {
  render: () => (
    <NotificationSettingsContent
      isEnabled={false}
      onToggle={() => {}}
      vaults={mockVaults}
      onVaultToggle={() => {}}
    />
  ),
}

export const Expanded: Story = {
  render: () => (
    <NotificationSettingsContent
      isEnabled={true}
      onToggle={() => {}}
      vaults={mockVaults}
      onVaultToggle={() => {}}
    />
  ),
}
