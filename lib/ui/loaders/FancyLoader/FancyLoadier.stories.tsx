import type { Meta, StoryObj } from '@storybook/react-vite'

import { FancyLoader } from '.'

const meta: Meta<typeof FancyLoader> = {
  title: 'Foundation/Feedback/FancyLoader',
  component: FancyLoader,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default loader',
}

export const OnDark: Story = {
  name: 'On dark background',
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
  },
}

export const Inline: Story = {
  name: 'Inline with text',
  render: () => (
    <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      Loading data...
      <FancyLoader />
    </p>
  ),
}
