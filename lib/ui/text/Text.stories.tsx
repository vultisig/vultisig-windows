import type { Meta, StoryObj } from '@storybook/react-vite'

import { GradientText, StrictText, Text } from '.'

const meta: Meta<typeof Text> = {
  title: 'Foundation/Typography/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    children: { table: { disable: true } },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Regular: Story = {
  name: 'Regular text',
}

export const H1Hero: Story = {
  name: 'Variant: h1Hero',
  args: {
    variant: 'h1Hero',
  },
}

export const H1Regular: Story = {
  name: 'Variant: h1Regular',
  args: {
    variant: 'h1Regular',
  },
}

export const Colored: Story = {
  name: 'Primary color',
  args: {
    color: 'primary',
    weight: 600,
  },
}

export const Centered: Story = {
  name: 'Centered horizontally',
  args: {
    centerHorizontally: true,
  },
}

export const Gradient: Story = {
  name: 'Gradient text',
  render: args => (
    <GradientText {...args}>Colourful headline gradient</GradientText>
  ),
}

export const Strict: Story = {
  name: 'StrictText preset',
  render: args => <StrictText {...args}>Strict text style</StrictText>,
}
