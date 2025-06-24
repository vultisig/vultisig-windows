import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { AmountTextInput } from '.'

const meta: Meta<typeof AmountTextInput> = {
  title: 'Foundation/Inputs/AmountTextInput',
  component: AmountTextInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    unit: {
      control: 'text',
      description: 'Prefix/suffix unit shown inside the input',
    },
    value: {
      control: { type: 'number', min: 0, step: 0.01 },
      description: 'Current numeric value (null for empty)',
    },
    shouldBePositive: {
      control: 'boolean',
      description: "Forces positive numbers (strips '-')",
    },
    shouldBeInteger: {
      control: 'boolean',
      description: 'Parses value as integer rather than float',
    },
    label: {
      control: 'text',
    },
    labelPosition: {
      control: 'radio',
      options: ['left', 'right'],
    },
    suggestion: {
      table: { disable: true },
    },
    onValueChange: { action: 'change' },
  },
  args: {
    value: null,
    unit: '$',
    label: 'Amount',
    placeholder: 'Enter amount',
    shouldBePositive: false,
    shouldBeInteger: false,
    labelPosition: 'right',
    suggestion: <Text color="supporting">Max: 1,000</Text>,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Template: Story = {
  render: args => {
    const [val, setVal] = useState<number | null>(args.value ?? null)
    return (
      <AmountTextInput
        {...args}
        value={val}
        onValueChange={v => {
          setVal(v)
          args.onValueChange?.(v)
        }}
      />
    )
  },
}

export const Playground: Story = { ...Template }

export const WithUnit: Story = {
  ...Template,
  name: 'With currency unit',
  args: { unit: '$', placeholder: '0.00' },
}

export const PositiveInteger: Story = {
  ...Template,
  name: 'Positive integer only',
  args: {
    value: 0,
    shouldBePositive: true,
    shouldBeInteger: true,
    placeholder: '0',
  },
}

export const LabelLeft: Story = {
  ...Template,
  name: 'Label left',
  args: { labelPosition: 'left' },
}
