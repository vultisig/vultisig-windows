import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { PasswordInput } from '.'

const meta: Meta<typeof PasswordInput> = {
  title: 'Foundation/Inputs/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    value: { control: 'text' },
    onValueChange: { action: 'change' },
  },
  args: {
    placeholder: 'Enter password',
    disabled: false,
    error: '',
    value: '',
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Template: Story = {
  render: args => {
    const [val, setVal] = useState<string>(
      typeof args.value === 'string' ? args.value : ''
    )
    return (
      <PasswordInput
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

export const WithError: Story = {
  ...Template,
  name: 'With error message',
  args: {
    error: 'Password too weak',
    value: '123',
  },
}

export const Disabled: Story = {
  ...Template,
  args: {
    disabled: true,
    value: 'secret',
  },
}
