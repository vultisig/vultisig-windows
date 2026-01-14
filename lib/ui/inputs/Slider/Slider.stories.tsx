import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { VStack } from '../../layout/Stack'
import { Text } from '../../text'
import { Slider } from '.'

const meta: Meta<typeof Slider> = {
  title: 'Foundation/Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current value of the slider',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    showLabels: {
      control: 'boolean',
      description: 'Show min/max labels on sides',
    },
    minLabel: {
      control: 'text',
      description: 'Label for minimum value',
    },
    maxLabel: {
      control: 'text',
      description: 'Label for maximum value',
    },
    showDots: {
      control: 'boolean',
      description: 'Show dot indicators below the track',
    },
    onChange: { action: 'change' },
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    showLabels: true,
    minLabel: '0%',
    maxLabel: '100%',
    showDots: true,
    dotPositions: [25, 50, 75],
  },
  decorators: [
    Story => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithState: Story = {
  name: 'Interactive',
  render: args => {
    const [value, setValue] = useState(args.value)
    return (
      <VStack gap={16}>
        <Slider {...args} value={value} onChange={setValue} />
        <Text size={14} color="shy">
          Current value: {value}%
        </Text>
      </VStack>
    )
  },
}

export const AtMinimum: Story = {
  name: 'At 0%',
  args: {
    value: 0,
  },
}

export const AtMaximum: Story = {
  name: 'At 100%',
  args: {
    value: 100,
  },
}

export const WithoutLabels: Story = {
  args: {
    showLabels: false,
  },
}

export const WithoutDots: Story = {
  args: {
    showDots: false,
  },
}

export const CustomLabels: Story = {
  args: {
    minLabel: 'Min',
    maxLabel: 'Max',
  },
}

export const CustomDotPositions: Story = {
  args: {
    dotPositions: [20, 40, 60, 80],
  },
}

export const CustomRange: Story = {
  name: 'Custom Range (0-1000)',
  args: {
    min: 0,
    max: 1000,
    value: 500,
    step: 10,
    minLabel: '0',
    maxLabel: '1000',
  },
}
