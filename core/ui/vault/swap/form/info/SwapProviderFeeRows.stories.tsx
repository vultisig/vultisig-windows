import { VStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'

import { getCoinPricesQueryKeys } from '../../../../chain/coin/price/queries/useCoinPricesQuery'
import { ReviewCard } from '../../../../mpc/keysign/review/ReviewCard'
import { ReviewRow } from '../../../../mpc/keysign/review/ReviewRow'
import { TxFeeRow } from '../../../../mpc/keysign/tx/components/TxFeeRow'
import { CoreProvider, CoreState } from '../../../../state/core'
import { StorageKey } from '../../../../storage/StorageKey'
import { CurrentVaultProvider } from '../../../state/currentVault'
import { getSwapFeeDisclosure } from '../../affiliate/affiliateBps'
import { SwapProviderFees } from '../../queries/resolveSwapFees'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapProviderFeeRows } from './SwapProviderFeeRows'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

const solanaUsdc: AccountCoin = {
  chain: Chain.Solana,
  id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  address: 'story',
  ticker: 'USDC',
  logo: 'usdc',
  decimals: 6,
  priceProviderId: 'usd-coin',
}

const vault: Vault & { coins: AccountCoin[] } = {
  name: 'Story vault',
  publicKeys: { ecdsa: 'story-ecdsa', eddsa: 'story-eddsa' },
  keyShares: { ecdsa: 'share', eddsa: 'share' },
  hexChainCode: 'chain-code',
  signers: ['Mac-6001'],
  localPartyId: 'Mac-6001',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
  coins: [solanaUsdc],
}

// The rows only read the fiat currency.
const coreState = { getFiatCurrency: async () => 'usd' } as CoreState

// The coin exactly as the price query keys it.
const pricedUsdc = {
  chain: solanaUsdc.chain,
  id: solanaUsdc.id,
  priceProviderId: solanaUsdc.priceProviderId,
}

// Every story prices its fees in USDC at $1, so a base unit is a micro-dollar
// and the stories past the first read as a $100 swap.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
queryClient.setQueryData([StorageKey.fiatCurrency], 'usd')
queryClient.setQueryData(
  getCoinPricesQueryKeys({ coins: [pricedUsdc], fiatCurrency: 'usd' }),
  { [coinKeyToString(solanaUsdc)]: 1 }
)

const usdc = (amount: bigint): SwapFee => ({
  chain: solanaUsdc.chain,
  id: solanaUsdc.id,
  amount,
  decimals: solanaUsdc.decimals,
})

const vultDiscount = (tier: VultDiscountTier): SwapDiscount => ({
  vult: { tier },
})

// The row primitive of each surface the breakdown renders on, as each of them
// passes it in.
const surfaces: { name: string; renderRow: SwapFeeRowRenderer }[] = [
  {
    name: 'Swap form',
    renderRow: ({ label, value }) => (
      <StrictInfoRow>
        <span>{label}</span>
        <Text color="supporting">{value}</Text>
      </StrictInfoRow>
    ),
  },
  {
    name: 'Review sheet',
    renderRow: ({ label, value }) => (
      <ReviewRow label={label} value={value} size="small" />
    ),
  },
  {
    name: 'Done screen',
    renderRow: ({ label, value }) => (
      <TxFeeRow label={label}>
        <Text size={14} color="shy">
          {value}
        </Text>
      </TxFeeRow>
    ),
  },
]

type SwapProviderFeeRowsStoryProps = {
  fees: SwapProviderFees
  discounts: SwapDiscount[]
}

/**
 * The provider rows over the net they add up to, on every surface that shows
 * them. The network fee is left out.
 */
const SwapProviderFeeRowsStory = ({
  fees,
  discounts,
}: SwapProviderFeeRowsStoryProps) => {
  const { t } = useTranslation()
  const { affiliate, referral, protocol } = fees
  const charged = [affiliate, referral, protocol].filter(
    (fee): fee is SwapFee => fee !== undefined
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CoreProvider value={coreState}>
        <CurrentVaultProvider value={vault}>
          <VStack gap={16} style={{ maxWidth: 361 }}>
            {surfaces.map(({ name, renderRow }) => (
              <VStack key={name} gap={8}>
                <Text size={12} color="shy">
                  {name}
                </Text>
                <ReviewCard style={{ padding: 16 }}>
                  <VStack gap={12} fullWidth>
                    <SwapProviderFeeRows
                      renderRow={renderRow}
                      fees={fees}
                      disclosure={getSwapFeeDisclosure(discounts)}
                    />
                    {renderRow({
                      label: t('total_fee'),
                      value: <SwapFeeFiatValue value={charged} />,
                    })}
                  </VStack>
                </ReviewCard>
              </VStack>
            ))}
          </VStack>
        </CurrentVaultProvider>
      </CoreProvider>
    </QueryClientProvider>
  )
}

const meta: Meta<typeof SwapProviderFeeRowsStory> = {
  title: 'Vault/Swap/SwapProviderFeeRows',
  component: SwapProviderFeeRowsStory,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof meta>

export const Gold: Story = {
  name: 'Gold: list rate less the tier lands on the charge',
  // vultisig-windows#4953: SOL → USDC through Jupiter charged 0.30%.
  args: {
    fees: { affiliate: usdc(2_911n) },
    discounts: [vultDiscount('gold')],
  },
}

export const GoldWithReferral: Story = {
  name: 'Gold and a referral, each taking its own amount off',
  args: {
    fees: { affiliate: usdc(150_000n), referral: usdc(100_000n) },
    discounts: [vultDiscount('gold'), { referral: {} }],
  },
}

export const Ultimate: Story = {
  name: 'Ultimate: the whole list rate waived',
  args: {
    fees: { affiliate: usdc(0n), affiliateNotional: usdc(100_000_000n) },
    discounts: [vultDiscount('ultimate')],
  },
}

export const UltimateFeeOmitted: Story = {
  name: 'Ultimate, with the zero fee left out of the quote',
  // SwapKit and LI.FI drop a zero affiliate fee rather than itemize it.
  args: {
    fees: { affiliateNotional: usdc(100_000_000n) },
    discounts: [vultDiscount('ultimate')],
  },
}

export const GoldWithProviderFee: Story = {
  name: "Gold, beside the provider's own fee",
  args: {
    fees: { affiliate: usdc(300_000n), protocol: usdc(250_000n) },
    discounts: [vultDiscount('gold')],
  },
}

export const NoDiscount: Story = {
  name: 'No discount: the list rate is the charge',
  args: {
    fees: { affiliate: usdc(500_000n) },
    discounts: [],
  },
}

export const IncludedInRateDiscounted: Story = {
  name: 'Fee inside the quoted rate, discounted: no rate, no rows',
  args: {
    fees: {},
    discounts: [vultDiscount('gold')],
  },
}

export const IncludedInRate: Story = {
  name: 'Fee inside the quoted rate, undiscounted',
  args: {
    fees: {},
    discounts: [],
  },
}
