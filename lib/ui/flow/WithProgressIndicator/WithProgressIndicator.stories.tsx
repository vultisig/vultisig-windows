import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from '../../text'
import { WithProgressIndicator } from '.'

const meta: Meta<typeof WithProgressIndicator> = {
  title: 'Flow/WithProgressIndicator',
  component: WithProgressIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Progress value between 0 (0%) and 1 (100%).',
    },
  },
  args: {
    value: 0.35,
    children: <Text>Some content goes here</Text>,
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Start: Story = {
  name: 'Start (0%)',
  args: {
    value: 0,
    children: <Text>Start of the flow</Text>,
  },
}

export const Halfway: Story = {
  name: 'Halfway (50%)',
  args: {
    value: 0.5,
    children: <Text>Half-way point</Text>,
  },
}

export const Complete: Story = {
  name: 'Complete (100%)',
  args: {
    value: 1,
    children: <Text>All done!</Text>,
  },
}
