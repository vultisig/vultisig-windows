import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getResolvedQuery, pendingQuery } from '@lib/ui/query/Query'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

import { TokenApproval } from './core/TokenApproval'
import { TokenApprovalsContent } from './TokenApprovalsContent'

const meta = {
  title: 'Settings/TokenApprovals',
} satisfies Meta

export default meta
type Story = StoryObj

type KnownTokenInput<T> = {
  chain: T
  ticker: string
}

const knownToken = <T extends EvmChain | typeof OtherChain.Solana>({
  chain,
  ticker,
}: KnownTokenInput<T>) => {
  const { id, decimals, logo } = shouldBePresent(
    knownTokens[chain].find(token => token.ticker === ticker),
    ticker
  )

  return {
    chain,
    id: shouldBePresent(id, `${ticker} id`),
    ticker,
    decimals,
    logo,
  }
}

const ethereumApprovals: TokenApproval[] = [
  {
    kind: 'erc20',
    token: knownToken({ chain: EvmChain.Ethereum, ticker: 'USDT' }),
    spender: '0x111111125421cA6dc452d289314280a0f8842A65',
    allowance: 2n ** 256n - 1n,
  },
  {
    kind: 'erc20',
    token: knownToken({ chain: EvmChain.Ethereum, ticker: 'USDC' }),
    spender: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    allowance: 2n ** 256n - 1n - 4_250_000n,
  },
  {
    kind: 'permit2',
    token: knownToken({ chain: EvmChain.Ethereum, ticker: 'USDC' }),
    spender: '0x66a9893cC07D91D95644AEDD05D03f95e1dBA8Af',
    allowance: 2n ** 160n - 1n,
    expiration: 1_800_000_000,
  },
  {
    kind: 'erc20',
    token: knownToken({ chain: EvmChain.Ethereum, ticker: 'DAI' }),
    spender: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A21E',
    allowance: 2_000n * 10n ** 18n,
  },
  {
    kind: 'erc20',
    token: knownToken({ chain: EvmChain.Ethereum, ticker: 'USDC' }),
    spender: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    allowance: 123_456_789_012_345_678_901_234_567n,
  },
]

const solanaApprovals: TokenApproval[] = [
  {
    kind: 'splDelegate',
    token: knownToken({ chain: OtherChain.Solana, ticker: 'USDC' }),
    spender: 'Hb2HDX6tnRfw5j442npy58Z2GBzJA58Nz7ipouWGT63p',
    allowance: 1_000_000_000n,
    tokenAccount: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
]

const resolved = (approvals: TokenApproval[], isComplete = true) =>
  getResolvedQuery({ approvals, isComplete })

type ContentProps = ComponentProps<typeof TokenApprovalsContent>

function Page({
  chains,
  uncheckedChains = [],
}: Pick<ContentProps, 'chains'> &
  Partial<Pick<ContentProps, 'uncheckedChains'>>) {
  const { t } = useTranslation()

  return (
    // Extension popup size, so scrolling and layout match the real page.
    <VStack style={{ width: 360, height: 650 }}>
      <PageHeader
        primaryControls={
          <IconButton onClick={() => {}}>
            <ChevronLeftIcon />
          </IconButton>
        }
        title={t('granted_approvals')}
      />
      <PageContent flexGrow scrollable>
        <TokenApprovalsContent
          chains={chains}
          uncheckedChains={uncheckedChains}
          onRevoke={() => {}}
        />
      </PageContent>
    </VStack>
  )
}

export const WithApprovals: Story = {
  render: () => (
    <Page
      chains={[
        {
          chain: EvmChain.Ethereum,
          isFetching: false,
          query: resolved(ethereumApprovals),
        },
        {
          chain: OtherChain.Solana,
          isFetching: false,
          query: resolved(solanaApprovals),
        },
        { chain: EvmChain.Base, isFetching: false, query: resolved([]) },
      ]}
    />
  ),
}

export const NoApprovals: Story = {
  render: () => (
    <Page
      chains={[
        { chain: EvmChain.Ethereum, isFetching: false, query: resolved([]) },
        { chain: OtherChain.Solana, isFetching: false, query: resolved([]) },
      ]}
    />
  ),
}

export const Refreshing: Story = {
  render: () => (
    <Page
      chains={[
        { chain: EvmChain.Ethereum, isFetching: true, query: resolved([]) },
        { chain: OtherChain.Solana, isFetching: false, query: resolved([]) },
      ]}
    />
  ),
}

export const PartlyLoaded: Story = {
  render: () => (
    <Page
      chains={[
        {
          chain: EvmChain.Ethereum,
          isFetching: false,
          query: resolved(ethereumApprovals),
        },
        { chain: EvmChain.Base, isFetching: true, query: pendingQuery },
        { chain: OtherChain.Solana, isFetching: true, query: pendingQuery },
      ]}
    />
  ),
}

export const SomeFailed: Story = {
  render: () => (
    <Page
      chains={[
        {
          chain: OtherChain.Solana,
          isFetching: false,
          query: resolved(solanaApprovals),
        },
        {
          chain: EvmChain.Ethereum,
          isFetching: false,
          query: { data: undefined, isPending: false, error: new Error() },
        },
      ]}
    />
  ),
}

export const PartlyChecked: Story = {
  render: () => (
    <Page
      chains={[
        {
          chain: EvmChain.Ethereum,
          isFetching: false,
          query: resolved(ethereumApprovals, false),
        },
        { chain: OtherChain.Solana, isFetching: false, query: resolved([]) },
      ]}
      uncheckedChains={[EvmChain.Blast, EvmChain.Mantle, EvmChain.Sei]}
    />
  ),
}
