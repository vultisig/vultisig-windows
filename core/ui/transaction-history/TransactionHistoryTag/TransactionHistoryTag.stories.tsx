import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  TransactionHistoryTag,
  type TransactionHistoryTagType,
} from './TransactionHistoryTag'

const meta: Meta<typeof TransactionHistoryTag> = {
  title: 'Transaction History/TransactionHistoryTag',
  component: TransactionHistoryTag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    type: {
      options: ['send', 'receive', 'swap', 'approve'],
      control: 'select',
    },
  },
}
export default meta

type Story = StoryObj<typeof TransactionHistoryTag>

export const Send: Story = {
  args: { type: 'send' as TransactionHistoryTagType },
}

export const Receive: Story = {
  args: { type: 'receive' as TransactionHistoryTagType },
}

export const Swap: Story = {
  args: { type: 'swap' as TransactionHistoryTagType },
}

export const Approve: Story = {
  args: { type: 'approve' as TransactionHistoryTagType },
}

export const AllTags: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TransactionHistoryTag type="send" />
      <TransactionHistoryTag type="receive" />
      <TransactionHistoryTag type="swap" />
      <TransactionHistoryTag type="approve" />
    </div>
  ),
}
