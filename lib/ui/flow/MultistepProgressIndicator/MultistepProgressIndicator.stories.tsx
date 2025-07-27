import type { Meta, StoryObj } from '@storybook/react-vite'

import { MultistepProgressIndicator } from '.'

const maxSteps = 10 as const
const VARIANTS = ['dots', 'bars'] as const

const meta: Meta<typeof MultistepProgressIndicator> = {
  title: 'Flow/MultistepProgressIndicator',
  component: MultistepProgressIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    steps: {
      control: { type: 'range', min: 1, max: maxSteps, step: 1 },
      description: `Total number of steps (1-${maxSteps})`,
    },
    value: {
      control: { type: 'range', min: 0, max: maxSteps - 1, step: 1 },
      description: 'Current (0-based) step',
    },
    variant: { control: 'radio', options: VARIANTS },
    markPreviousStepsAsCompleted: { control: 'boolean' },
  },
  args: {
    steps: 5,
    value: 2,
    variant: 'dots',
    markPreviousStepsAsCompleted: false,
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Dots: Story = {
  name: 'Dots (default)',
  args: { variant: 'dots' },
}
