import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from '../../text'
import { Switch } from '.'

const meta: Meta<typeof Switch> = {
  title: 'Foundation/Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the switch is on (true) or off (false)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables user interaction when true',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a spinner inside the thumb and blocks interaction',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered next to the switch',
    },
    onChange: { action: 'change' },
  },
  args: {
    checked: false,
    disabled: false,
    loading: false,
    label: 'Enable feature',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Unchecked: Story = {
  name: 'Unchecked (Off)',
  args: {
    checked: false,
  },
}

export const Checked: Story = {
  name: 'Checked (On)',
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Can't touch this",
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    label: <Text>Processing…</Text>,
  },
}
