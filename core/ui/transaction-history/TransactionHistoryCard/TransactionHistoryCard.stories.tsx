import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chain } from '@vultisig/core-chain/Chain'

import type { TransactionHistoryTagType } from '../TransactionHistoryTag'
import { TransactionHistoryCard } from './TransactionHistoryCard'

const meta: Meta<typeof TransactionHistoryCard> = {
  title: 'Transaction History/TransactionHistoryCard',
  component: TransactionHistoryCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    tagType: {
      options: ['send', 'receive', 'swap', 'approve'],
      control: 'select',
    },
    status: {
      options: ['successful', 'error'],
      control: 'select',
    },
  },
}
export default meta

type Story = StoryObj<typeof TransactionHistoryCard>

/** Realistic addresses (full); card displays them truncated via truncateId (6...4). */
const ethAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1'
const solAddress = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'

/** Coins with logos for real asset icons (same as chainFeeCoin / CoinIcon). */
const runeCoin = { chain: Chain.THORChain, logo: 'rune' as const }
const solCoin = { chain: Chain.Solana, logo: 'solana' as const }
const ethCoin = { chain: Chain.Ethereum, logo: 'eth' as const }

/** Single story page: all card variants (successful Send/Receive/Swap, error with and without message) for quick glance. */
export const AllCards: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 343,
      }}
    >
      <TransactionHistoryCard
        tagType="send"
        status="successful"
        amountUsd="$1,000.54"
        amountCrypto="1,000.12"
        symbol="RUNE"
        pill={{ direction: 'to', address: ethAddress }}
        coin={runeCoin}
      />
      <TransactionHistoryCard
        tagType="receive"
        status="successful"
        amountUsd="$12,204.56"
        amountCrypto="200.50"
        symbol="SOL"
        pill={{ direction: 'from', address: solAddress }}
        coin={solCoin}
      />
      <TransactionHistoryCard
        tagType="swap"
        status="successful"
        amountUsd="$34,752.57"
        amountCrypto="20.50"
        symbol="ETH"
        pill={{ providerName: 'THORChain' }}
        coin={ethCoin}
      />
      <TransactionHistoryCard
        tagType="send"
        status="error"
        amountUsd="$1,000.54"
        amountCrypto="1,000.12"
        symbol="RUNE"
        pill={{ direction: 'to', address: ethAddress }}
        errorMessage="Slippage tolerance exceeded"
        coin={runeCoin}
      />
      <TransactionHistoryCard
        tagType="swap"
        status="error"
        amountUsd="$34,752.57"
        amountCrypto="20.50"
        symbol="ETH"
        pill={{ providerName: 'THORChain' }}
        coin={ethCoin}
      />
    </div>
  ),
}

export const SuccessfulSend: Story = {
  args: {
    tagType: 'send' as TransactionHistoryTagType,
    status: 'successful',
    amountUsd: '$1,000.54',
    amountCrypto: '1,000.12',
    symbol: 'RUNE',
    pill: { direction: 'to' as const, address: ethAddress },
  },
  render: args => <TransactionHistoryCard {...args} coin={runeCoin} />,
}

export const ErrorWithMessage: Story = {
  args: {
    tagType: 'send' as TransactionHistoryTagType,
    status: 'error',
    amountUsd: '$1,000.54',
    amountCrypto: '1,000.12',
    symbol: 'RUNE',
    pill: { direction: 'to' as const, address: ethAddress },
    errorMessage: 'Slippage tolerance exceeded',
  },
  render: args => <TransactionHistoryCard {...args} coin={runeCoin} />,
}
