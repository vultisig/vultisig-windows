import type { Meta, StoryObj } from '@storybook/react-vite'

import { OTPInput } from '.'

const meta: Meta<typeof OTPInput> = {
  title: 'Foundation/Inputs/OTPInput',
  component: OTPInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    length: {
      control: { type: 'range', min: 4, max: 8, step: 1 },
      description: 'Number of boxes',
    },
    validation: {
      control: { type: 'radio', options: [undefined, 'valid', 'invalid'] },
    },
    includePasteButton: { control: 'boolean' },
    onValueChange: { action: 'value change' },
    onCompleted: { action: 'completed' },
  },
  args: {
    length: 4,
    validation: undefined,
    includePasteButton: true,
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Default4: Story = {
  name: '4-digit (default)',
}

export const SixDigits: Story = {
  name: '6-digit',
  args: { length: 6 },
}

export const ValidState: Story = {
  name: 'Valid',
  args: { validation: 'valid' },
}

export const InvalidState: Story = {
  name: 'Invalid',
  args: { validation: 'invalid' },
}

export const NoPasteButton: Story = {
  name: 'Without “Paste”',
  args: { includePasteButton: false },
}
