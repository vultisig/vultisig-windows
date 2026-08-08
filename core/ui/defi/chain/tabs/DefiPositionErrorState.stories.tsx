import type { Meta, StoryObj } from '@storybook/react-vite'

import { DefiPositionErrorState } from './DefiPositionErrorState'

const meta = {
  title: 'DeFi/DefiPositionErrorState',
} satisfies Meta

export default meta
type Story = StoryObj

const Frame = ({ onRetry }: { onRetry: () => Promise<unknown> }) => (
  <div style={{ width: 380 }}>
    <DefiPositionErrorState onRetry={onRetry} />
  </div>
)

export const Default: Story = {
  render: () => <Frame onRetry={async () => {}} />,
}

// Retry resolves after a delay so the button's loading spinner is visible.
export const SlowRetry: Story = {
  render: () => (
    <Frame onRetry={() => new Promise(resolve => setTimeout(resolve, 2000))} />
  ),
}
