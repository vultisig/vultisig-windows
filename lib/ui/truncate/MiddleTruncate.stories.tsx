import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { MiddleTruncate } from '.'

const meta: Meta<typeof MiddleTruncate> = {
  title: 'Foundation/Utils/MiddleTruncate',
  component: MiddleTruncate,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    text: '0x1234567890abcdef1234567890abcdef12345678',
    width: 160,
  },
  argTypes: {
    onClick: { table: { disable: true } },
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default truncation',
}

export const CustomWidth: Story = {
  name: 'Custom width 240 px',
  args: {
    width: 240,
  },
}

export const InteractiveWidth: Story = {
  name: 'Interactive width slider',
  render: args => {
    const [width, setWidth] = useState(160)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="range"
          min={80}
          max={320}
          value={width}
          onChange={e => setWidth(Number(e.target.value))}
          style={{ width: 240 }}
        />
        <MiddleTruncate {...args} width={width} />
      </div>
    )
  },
}

export const Clickable: Story = {
  name: 'Clickable link',
  args: {
    onClick: () => alert('Clicked!'),
  },
}
