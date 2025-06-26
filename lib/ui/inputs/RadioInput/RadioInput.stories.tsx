import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { RadioInput } from '.'

const options = ['red', 'green', 'blue'] as const

type OptionValue = (typeof options)[number]

const meta: Meta<typeof RadioInput<OptionValue>> = {
  title: 'Foundation/Inputs/RadioInput',
  component: RadioInput,
  tags: ['autodocs'],
  argTypes: {
    options: { table: { disable: true } },
    value: {
      control: 'radio',
      options: [null, ...options] as (OptionValue | null)[],
      description: 'Currently selected option (null = none)',
    },
    minOptionHeight: {
      control: { type: 'number', min: 32, step: 4 },
      description: 'Minimum height for option buttons (px)',
    },
    onChange: { action: 'change' },
    renderOption: { table: { disable: true } },
  },
  args: {
    options: options,
    value: null,
    minOptionHeight: undefined,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Template: Story = {
  render: args => {
    const [val, setVal] = React.useState<OptionValue | null>(
      args.value as OptionValue | null
    )

    return (
      <RadioInput<OptionValue>
        {...args}
        value={val}
        onChange={v => {
          setVal(v)
          args.onChange?.(v)
        }}
        renderOption={opt => opt.toUpperCase()}
      />
    )
  },
}

export const Playground: Story = { ...Template }

export const RedSelected: Story = {
  ...Template,
  name: 'Red selected',
  args: { value: 'red' },
}

export const GreenSelected: Story = {
  ...Template,
  name: 'Green selected',
  args: { value: 'green' },
}

export const BlueSelected: Story = {
  ...Template,
  name: 'Blue selected',
  args: { value: 'blue' },
}

export const WithMinHeight: Story = {
  ...Template,
  name: 'Custom minOptionHeight',
  args: { minOptionHeight: 100 },
}
