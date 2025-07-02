import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { MultiCharacterInput } from '.'

const meta: Meta<typeof MultiCharacterInput> = {
  title: 'Foundation/Inputs/MultiCharacterInput',
  component: MultiCharacterInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    length: {
      control: { type: 'range', min: 4, max: 8, step: 1 },
      description: 'Number of input boxes',
    },
    validation: {
      control: {
        type: 'radio',
        options: ['idle', 'valid', 'invalid', 'loading'],
      },
      description: 'Visual validation state',
    },
    includePasteButton: { control: 'boolean' },
    autoFocusFirst: { control: 'boolean' },
    onChange: { action: 'value change' },
  },
  args: {
    length: 4,
    validation: 'idle',
    includePasteButton: true,
    autoFocusFirst: true,
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

export const EightDigits: Story = {
  name: '8-digit',
  args: { length: 8 },
}

export const ValidState: Story = {
  name: 'Valid',
  args: { validation: 'valid', value: '1234' },
}

export const InvalidState: Story = {
  name: 'Invalid',
  args: { validation: 'invalid', value: '1234' },
}

export const LoadingState: Story = {
  name: 'Loading',
  args: { validation: 'loading', value: '1234' },
}

export const NoPasteButton: Story = {
  name: 'Without “Paste”',
  args: { includePasteButton: false },
}

export const ControlledExample: Story = {
  name: 'Controlled (live value)',
  render: args => {
    const [value, setValue] = useState<string | null>(null)

    return (
      <>
        <MultiCharacterInput {...args} value={value} onChange={setValue} />
        <p style={{ marginTop: 16, fontFamily: 'monospace' }}>
          Current value: {value ?? 'null'}
        </p>
      </>
    )
  },
}
