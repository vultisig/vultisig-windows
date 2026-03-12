import { VStack } from '@lib/ui/layout/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { AgentChatInput } from './AgentChatInput'

const meta = {
  title: 'Agent/AgentChatInput',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj

function Interactive({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)

  return (
    <div style={{ width: 328 }}>
      <AgentChatInput
        value={value}
        onChange={setValue}
        onSubmit={() => {
          alert(`Sent: ${value}`)
          setValue('')
        }}
      />
    </div>
  )
}

export const Empty: Story = {
  render: () => <Interactive />,
}

export const Filled: Story = {
  render: () => <Interactive initialValue="Swap 10 ETH to USDC" />,
}

export const BothStates: Story = {
  render: () => (
    <VStack gap={24} style={{ width: 328 }}>
      <AgentChatInput
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        placeholder="Start typing..."
      />
      <AgentChatInput
        value="Swap 10 ETH to USDC"
        onChange={() => {}}
        onSubmit={() => {}}
      />
    </VStack>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 328 }}>
      <AgentChatInput
        value="Cannot edit"
        onChange={() => {}}
        onSubmit={() => {}}
        disabled
      />
    </div>
  ),
}
