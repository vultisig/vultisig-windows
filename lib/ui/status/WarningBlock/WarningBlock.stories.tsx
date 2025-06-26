import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { WarningBlock } from '.'

const meta: Meta<typeof WarningBlock> = {
  title: 'Foundation/Feedback/WarningBlock',
  component: WarningBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    children:
      'This action might have unintended consequences. Proceed with caution.' as unknown as undefined,
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
    iconTooltipContent: 'Further details about the warning.',
  },
}

export const CustomIcon: Story = {
  name: 'Custom icon',
  args: {
    icon: CircleInfoIcon,
  },
}
