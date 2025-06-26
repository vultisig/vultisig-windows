import type { Meta, StoryObj } from '@storybook/react-vite'

import { EyeIcon } from '../../icons/EyeIcon'
import { Hoverable } from '.'

const meta: Meta<typeof Hoverable> = {
  title: 'Foundation/Hoverable',
  component: Hoverable,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },

  argTypes: {
    horizontalOffset: { control: { type: 'number', min: 0, max: 32, step: 1 } },
    verticalOffset: { control: { type: 'number', min: 0, max: 32, step: 1 } },
    as: { table: { disable: true } },
    children: { table: { disable: true } },
  },

  args: {
    horizontalOffset: 8,
    verticalOffset: 8,
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: args => (
    <Hoverable {...args}>
      <EyeIcon />
    </Hoverable>
  ),
}

export const WithText: Story = {
  parameters: { controls: { hideNoControlsWarning: true } },
  render: () => (
    <Hoverable style={{ fontSize: 16, padding: '4px 12px' }}>
      Hover me
    </Hoverable>
  ),
}

export const OffsetExamples: Story = {
  parameters: { controls: { hideNoControlsWarning: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {[0, 4, 12, 20].map(offset => (
        <Hoverable
          key={offset}
          horizontalOffset={offset}
          verticalOffset={offset}
        >
          {offset}px
        </Hoverable>
      ))}
    </div>
  ),
}
