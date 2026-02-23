import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'

import { TransactionStatusAnimation } from './TransactionStatusAnimation'

const meta: Meta<typeof TransactionStatusAnimation> = {
  title: 'Keysign/TransactionStatusAnimation',
  component: TransactionStatusAnimation,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <div style={{ width: 400, border: '1px dashed #333' }}>
          <Story />
        </div>
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof TransactionStatusAnimation>

export const Pending: Story = {
  args: { status: 'pending' },
}

export const Success: Story = {
  args: { status: 'success' },
}

export const Error: Story = {
  args: { status: 'error' },
}

// Transition simulation stories
export const PendingToSuccess: Story = {
  render: () => {
    const [status, setStatus] = useState<'pending' | 'success'>('pending')

    useEffect(() => {
      const timer = setTimeout(() => setStatus('success'), 3000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div>
        <TransactionStatusAnimation status={status} />
        <p style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
          Status: {status} (transitions after 3s)
        </p>
      </div>
    )
  },
}

export const PendingToError: Story = {
  render: () => {
    const [status, setStatus] = useState<'pending' | 'error'>('pending')

    useEffect(() => {
      const timer = setTimeout(() => setStatus('error'), 3000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div>
        <TransactionStatusAnimation status={status} />
        <p style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
          Status: {status} (transitions after 3s)
        </p>
      </div>
    )
  },
}
