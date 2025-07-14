import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from '.'

const meta: Meta<typeof Skeleton> = {
  title: 'Foundation/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    children: { table: { disable: true } },
  },
  args: {
    variant: 'rectangular',
    width: '120px',
    height: '16px',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Rectangular: Story = {}

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: '60px',
    height: '60px',
  },
}

export const Colored: Story = {
  name: 'Filled with theme color',
  args: {
    fill: 'primary',
  },
}

export const Paragraph: Story = {
  name: 'Paragraph placeholder',
  render: args => (
    <div
      style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} {...args} width="100%" height="12px" />
      ))}
    </div>
  ),
}

export const InCard: Story = {
  name: 'Inside card',
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
  },
  render: args => (
    <div
      style={{
        width: 280,
        padding: 16,
        borderRadius: 8,
        background: '#1f2937',
      }}
    >
      <Skeleton {...args} width="100%" height="160px" borderRadius="8px" />
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <Skeleton {...args} width="60%" height="14px" />
        <Skeleton {...args} width="80%" height="14px" />
        <Skeleton {...args} width="40%" height="14px" />
      </div>
    </div>
  ),
}
