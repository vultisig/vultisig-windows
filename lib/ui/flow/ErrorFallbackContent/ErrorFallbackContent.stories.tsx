import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorFallbackContent } from '.'

const meta: Meta<typeof ErrorFallbackContent> = {
  title: 'Flow/ErrorFallbackContent',
  component: ErrorFallbackContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    title: 'Something went wrong',
    error: 'Please try refreshing the page.',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const LongMessage: Story = {
  args: {
    error:
      'The server returned a 500 error. We’ve logged the problem and will fix it as soon as possible. Meanwhile, you can go back or reload.',
  },
}

export const TitleOnly: Story = {
  args: { error: undefined },
  parameters: { controls: { hideNoControlsWarning: true } },
}
