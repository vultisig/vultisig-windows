import type { Meta, StoryObj } from '@storybook/react-vite'

import { AgentHistoryView } from './AgentHistoryView'

const meta = {
  title: 'Agent/AgentHistoryView',
  component: AgentHistoryView,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    Story => (
      <div style={{ width: 360, height: 760 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentHistoryView>

export default meta

type Story = StoryObj<typeof AgentHistoryView>

const sampleConversations = [
  {
    id: '1',
    public_key: 'vault-key',
    title: 'Swap some BTC into USDC',
    created_at: '2026-03-10T12:00:00.000Z',
    updated_at: '2026-03-10T12:04:00.000Z',
  },
  {
    id: '2',
    public_key: 'vault-key',
    title: 'Show plugins I can enable',
    created_at: '2026-03-10T11:00:00.000Z',
    updated_at: '2026-03-10T11:03:00.000Z',
  },
  {
    id: '3',
    public_key: 'vault-key',
    title: 'Prepare a SOL transfer',
    created_at: '2026-03-09T16:30:00.000Z',
    updated_at: '2026-03-09T16:45:00.000Z',
  },
]

export const Loaded: Story = {
  args: {
    state: 'loaded',
    conversations: sampleConversations,
    onNewChat: () => {},
    onOpenChat: () => {},
  },
}

export const Loading: Story = {
  args: {
    state: 'loading',
    onNewChat: () => {},
    onOpenChat: () => {},
  },
}

export const Empty: Story = {
  args: {
    state: 'empty',
    onNewChat: () => {},
    onOpenChat: () => {},
  },
}

export const Error: Story = {
  args: {
    state: 'error',
    error: 'The request timed out before the history could load.',
    onNewChat: () => {},
    onOpenChat: () => {},
    onRetry: () => {},
  },
}
