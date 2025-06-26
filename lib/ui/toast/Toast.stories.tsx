import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'

import { ToastItem } from './ToastItem'

const meta: Meta<typeof ToastItem> = {
  title: 'Foundation/Feedback/ToastItem',
  component: ToastItem,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    children: { table: { disable: true } },
  },
  args: {
    children: 'Saved successfully!',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongMessage: Story = {
  name: 'Long text message',
  args: {
    children:
      'Your settings have been synced across all logged‑in devices. You can safely close this window.',
  },
}

export const WithIcon: Story = {
  name: 'With inline icon',
  args: {
    children: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TriangleAlertIcon />
        Something went wrong. Try again.
      </span>
    ),
  },
}

export const MultipleToasts: Story = {
  name: 'Stacked toasts',
  render: args => (
    <>
      <ToastItem {...args}>First toast</ToastItem>
      <ToastItem {...args}>Second toast</ToastItem>
    </>
  ),
}

export const Interactive: Story = {
  name: 'Interactive show / hide',
  render: args => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
      let id: NodeJS.Timeout | undefined
      if (visible) {
        id = setTimeout(() => setVisible(false), 3000)
      }
      return () => clearTimeout(id)
    }, [visible])

    return (
      <>
        <button
          onClick={() => setVisible(true)}
          style={{ position: 'fixed', top: 40, left: 40 }}
        >
          Show toast
        </button>
        {visible && <ToastItem {...args} />}
      </>
    )
  },
}
