import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { AgentBottomNavigationContent } from './AgentBottomNavigationContent'

const meta = {
  title: 'Navigation/AgentBottomNavigation',
} satisfies Meta

export default meta
type Story = StoryObj

type ActiveTab = 'wallet' | 'defi' | 'agent'

function Interactive({ initial = 'wallet' }: { initial?: ActiveTab }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initial)

  return (
    <AgentBottomNavigationContent
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onCameraPress={() => {}}
    />
  )
}

export const WalletActive: Story = {
  render: () => <Interactive initial="wallet" />,
}

export const DeFiActive: Story = {
  render: () => <Interactive initial="defi" />,
}

export const AgentActive: Story = {
  render: () => <Interactive initial="agent" />,
}
