import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'

import { ToastItem } from './ToastItem'
import { toastStatuses } from './ToastStatus'

const meta: Meta<typeof ToastItem> = {
  title: 'Foundation/Feedback/ToastItem',
  component: ToastItem,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    children: { table: { disable: true } },
    value: { control: 'inline-radio', options: toastStatuses },
    duration: { control: { type: 'range', min: 1000, max: 10000, step: 500 } },
  },
  args: {
    children: 'Saved successfully!',
    value: 'success',
    duration: 3000,
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Warning: Story = {
  args: {
    children: 'At least one vault is required',
    value: 'warning',
  },
}

export const Error: Story = {
  args: {
    children: 'Failed to copy address',
    value: 'error',
  },
}

export const LongMessage: Story = {
  name: 'Long text message',
  args: {
    children:
      'Your settings have been synced across all logged-in devices. You can safely close this window.',
  },
}

export const SlowRing: Story = {
  name: 'Slow ring fill',
  args: {
    duration: 10000,
  },
}

export const Interactive: Story = {
  name: 'Interactive show / hide',
  render: args => {
    const [shownAt, setShownAt] = useState<number | null>(null)

    useEffect(() => {
      if (shownAt === null) return
      const id = setTimeout(() => setShownAt(null), args.duration)
      return () => clearTimeout(id)
    }, [shownAt, args.duration])

    return (
      <>
        <button
          onClick={() => setShownAt(Date.now())}
          style={{ position: 'fixed', top: 40, left: 40 }}
        >
          Show toast
        </button>
        {shownAt === null ? null : <ToastItem {...args} key={shownAt} />}
      </>
    )
  },
}
