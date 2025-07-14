import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { InfoBlock } from '.'

const meta: Meta<typeof InfoBlock> = {
  title: 'Foundation/Feedback/InfoBlock',
  component: InfoBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    children: 'Remember to save your changes frequently.',
  },
  argTypes: {
    children: { table: { disable: true } },
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTooltip: Story = {
  name: 'With tooltip on icon',
  args: {
    iconTooltipContent: 'Auto‑save runs every 30 seconds as well.',
  },
}

export const CustomIcon: Story = {
  name: 'Custom icon',
  args: {
    icon: TriangleAlertIcon,
  },
}
