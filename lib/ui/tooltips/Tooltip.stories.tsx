import type { Meta, StoryObj } from '@storybook/react-vite'

import { InfoBlock } from '../status/InfoBlock'
import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Foundation/Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    content: { table: { disable: true } },
    renderOpener: { table: { disable: true } },
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Top: Story = {
  name: 'Placement: top (default)',
  render: () => (
    <Tooltip
      content="Tooltip content displayed above."
      renderOpener={props => <button {...props}>Hover me</button>}
    />
  ),
}

export const RichContent: Story = {
  name: 'Rich content',
  render: () => (
    <Tooltip
      content={<InfoBlock>This is a rich tooltip with layout.</InfoBlock>}
      placement="right"
      renderOpener={props => <button {...props}>Hover for info</button>}
    />
  ),
}

export const LongText: Story = {
  name: 'Long text auto‑wrap',
  render: () => (
    <Tooltip
      content="This tooltip has a lot of text to demonstrate how it wraps within the max‑width constraint. The quick brown fox jumps over the lazy dog."
      renderOpener={props => <button {...props}>Hover me</button>}
    />
  ),
}
