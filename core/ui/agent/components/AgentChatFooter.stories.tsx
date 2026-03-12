import { VStack } from '@lib/ui/layout/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { AgentChatFooter } from './AgentChatFooter'

const meta = {
  title: 'Agent/AgentChatFooter',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj

function ChatMode() {
  const [value, setValue] = useState('')
  return (
    <div style={{ width: 393 }}>
      <AgentChatFooter
        mode="chat"
        value={value}
        onChange={setValue}
        onSubmit={() => {
          alert(`Sent: ${value}`)
          setValue('')
        }}
        placeholder="Ask about plugins and policies..."
        isLoading={false}
        onStop={() => {}}
        onWalletClick={() => alert('Wallet clicked')}
      />
    </div>
  )
}

function PasswordMode({ initialError }: { initialError?: string }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(initialError ?? null)
  return (
    <div style={{ width: 393 }}>
      <AgentChatFooter
        mode="password"
        value={value}
        onChange={v => {
          setValue(v)
          setError(null)
        }}
        onSubmit={() => {
          if (value === 'wrong') {
            setError('Invalid password')
          } else {
            alert(`Password submitted: ${value}`)
            setValue('')
          }
        }}
        onCancel={() => alert('Cancelled')}
        error={error}
      />
    </div>
  )
}

export const Chat: Story = {
  render: () => <ChatMode />,
}

export const Password: Story = {
  render: () => <PasswordMode />,
}

export const PasswordWithError: Story = {
  render: () => <PasswordMode initialError="Invalid password" />,
}

export const AllStates: Story = {
  render: () => (
    <VStack gap={32} style={{ width: 393 }}>
      <ChatMode />
      <PasswordMode />
      <PasswordMode initialError="Invalid password" />
    </VStack>
  ),
}
