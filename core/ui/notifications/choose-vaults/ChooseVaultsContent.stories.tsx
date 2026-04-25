import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  ChooseVaultsContent,
  VaultNotificationItem,
} from './ChooseVaultsContent'

const mockVaults: VaultNotificationItem[] = [
  { id: '1', name: 'Vault 1', type: 'secure', enabled: true },
  { id: '2', name: 'Vault 2', type: 'fast', enabled: true },
  { id: '3', name: 'Vault 3', type: 'secure', enabled: false },
  { id: '4', name: 'Vault 4', type: 'fast', enabled: false },
]

const meta = {
  title: 'Notifications/ChooseVaultsContent',
} satisfies Meta

export default meta

type Story = StoryObj

const Interactive = () => {
  const [vaults, setVaults] = useState(mockVaults)

  const allEnabled = vaults.length > 0 && vaults.every(v => v.enabled)

  return (
    <ChooseVaultsContent
      allEnabled={allEnabled}
      onEnableAll={enabled => {
        setVaults(prev => prev.map(v => ({ ...v, enabled })))
      }}
      onVaultToggle={(vaultId, enabled) => {
        setVaults(prev =>
          prev.map(v => (v.id === vaultId ? { ...v, enabled } : v))
        )
      }}
      vaults={vaults}
    />
  )
}

export const Default: Story = {
  render: () => <Interactive />,
}
