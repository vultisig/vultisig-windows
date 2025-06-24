import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorFallbackContent } from '.'

const meta: Meta<typeof ErrorFallbackContent> = {
  title: 'Feedback/ErrorFallbackContent',
  component: ErrorFallbackContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
  },
  args: {
    title: 'Something went wrong',
    message: 'Please try refreshing the page.',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const LongMessage: Story = {
  args: {
    message:
      'The server returned a 500 error. We’ve logged the problem and will fix it as soon as possible. Meanwhile, you can go back or reload.',
  },
}

export const TitleOnly: Story = {
  args: { message: undefined },
  parameters: { controls: { hideNoControlsWarning: true } },
}
