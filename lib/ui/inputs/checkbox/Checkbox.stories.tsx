import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Foundation/Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: 'boolean',
      description: 'Checked (true / false)',
    },
    label: {
      control: 'text',
      description: 'Optional label text',
    },
    onChange: { action: 'change' },
  },
  args: {
    value: false,
    label: 'I agree to the terms',
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Unchecked: Story = {
  args: { value: false },
}

export const Checked: Story = {
  args: { value: true },
}

export const WithoutLabel: Story = {
  name: 'Without label',
  args: { label: undefined },
}
