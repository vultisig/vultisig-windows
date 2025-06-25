import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CollapsableStateIndicator } from '.'

const meta: Meta<typeof CollapsableStateIndicator> = {
  title: 'Foundation/Indicators/CollapsableStateIndicator',
  component: CollapsableStateIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    isOpen: false,
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {
  name: 'Closed state',
  args: { isOpen: false },
}

export const Open: Story = {
  name: 'Open state',
  args: { isOpen: true },
}

export const Toggle: Story = {
  name: 'Interactive toggle',
  render: args => {
    const [open, setOpen] = useState(false)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <button onClick={() => setOpen(v => !v)}>
          {open ? 'Collapse' : 'Expand'}
        </button>
        <CollapsableStateIndicator {...args} isOpen={open} />
      </div>
    )
  },
}
