import { HStack } from '@lib/ui/layout/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReviewCard } from '../../../../mpc/keysign/review/ReviewCard'
import { SwapReviewAmount } from './SwapReviewAmount'

const near = {
  chain: 'Ethereum',
  ticker: 'NEAR',
  decimals: 24,
  logo: 'near',
  priceProviderId: 'near',
} as const

const meta: Meta<typeof SwapReviewAmount> = {
  title: 'Vault/Swap/SwapReviewAmount',
  component: SwapReviewAmount,
  parameters: { layout: 'padded' },
  args: { coin: near, amount: 0.8596191426558598, fit: true },
  render: args => (
    <HStack gap={8}>
      <ReviewCard style={{ flex: 1 }}>
        <SwapReviewAmount {...args} />
      </ReviewCard>
      <ReviewCard style={{ flex: 1 }}>
        <SwapReviewAmount {...args} />
      </ReviewCard>
    </HStack>
  ),
}
export default meta

type Story = StoryObj<typeof meta>

export const LongEstimate: Story = {
  name: 'Long estimate is shortened to fit',
}

export const LongEstimateUnfitted: Story = {
  name: 'Without fit, as the signed side',
  args: { fit: false },
}

export const ShortEstimate: Story = {
  name: 'Short estimate is left alone',
  args: { amount: 12.5 },
}
