import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { TextInput } from '.'

const meta: Meta<typeof TextInput> = {
  title: 'Foundation/Inputs/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    validation: {
      control: 'radio',
      options: [undefined, 'valid', 'invalid', 'warning'],
    },
    isLoading: { control: 'boolean' },
    inputOverlay: { table: { disable: true } },
    value: { control: 'text' },
    onValueChange: { action: 'change' },
  },
  args: {
    value: '',
    placeholder: 'Enter text',
    disabled: false,
    label: 'Label',
    validation: undefined,
    isLoading: false,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Template: Story = {
  render: args => {
    const initialValue = typeof args.value === 'string' ? args.value : ''
    const [val, setVal] = useState<string>(initialValue)
    return (
      <TextInput
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

export const WithLabel: Story = {
  ...Template,
  name: 'With label & placeholder',
  args: {
    label: 'Username',
    placeholder: 'john.doe',
  },
}

export const Valid: Story = {
  ...Template,
  args: { validation: 'valid', value: 'looks good' },
}

export const Invalid: Story = {
  ...Template,
  args: { validation: 'invalid', value: 'oops' },
}

export const Warning: Story = {
  ...Template,
  args: { validation: 'warning', value: 'be careful' },
}

export const Loading: Story = {
  ...Template,
  args: { isLoading: true },
}

export const Disabled: Story = {
  ...Template,
  args: { disabled: true, value: 'cannot edit' },
}

export const WithOverlay: Story = {
  ...Template,
  name: 'With inputOverlay',
  args: {
    inputOverlay: (
      <div
        style={{
          position: 'absolute',
          left: 12,
          color: 'var(--color-primary, #00ADEF)',
        }}
      >
        <DollarIcon />
      </div>
    ),
    style: { paddingLeft: 36 },
    placeholder: '0.00',
  },
}
