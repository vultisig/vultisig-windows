import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { RadioOptionsList } from '.'

const OPTIONS = ['apple', 'banana', 'orange'] as const

export type OptionValue = (typeof OPTIONS)[number] | null

const meta: Meta<typeof RadioOptionsList<OptionValue>> = {
  title: 'Foundation/Inputs/RadioOptionsList',
  component: RadioOptionsList,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { table: { disable: true } },
    value: {
      control: 'radio',
      options: [null, ...OPTIONS] as OptionValue[],
      description: 'Currently selected option (null = none)',
    },
    onChange: { action: 'change' },
    renderOption: { table: { disable: true } },
  },
  args: {
    options: OPTIONS,
    value: null,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Template: Story = {
  render: args => {
    const [val, setVal] = React.useState<OptionValue>(args.value)
    return (
      <RadioOptionsList<OptionValue>
        {...args}
        value={val}
        onChange={v => {
          setVal(v)
          args.onChange?.(v)
        }}
        renderOption={opt => (opt === null ? 'None' : opt.toUpperCase())}
      />
    )
  },
}

export const Playground: Story = { ...Template }

export const NoneSelected: Story = {
  ...Template,
  name: 'None selected (null)',
  args: { value: null },
}

export const Apple: Story = {
  ...Template,
  args: { value: 'apple' },
}

export const Banana: Story = {
  ...Template,
  args: { value: 'banana' },
}

export const Orange: Story = {
  ...Template,
  args: { value: 'orange' },
}
