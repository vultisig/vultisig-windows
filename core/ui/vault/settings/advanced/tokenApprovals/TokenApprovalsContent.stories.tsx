import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TokenApproval } from './core/TokenApproval'
import { TokenApprovalsContent } from './TokenApprovalsContent'

const meta = {
  title: 'Settings/TokenApprovals',
} satisfies Meta

export default meta
type Story = StoryObj

const unlimited = 2n ** 256n - 1n

const ethereumToken = (ticker: string) => {
  const { id, decimals, logo } = shouldBePresent(
    knownTokens[EvmChain.Ethereum].find(token => token.ticker === ticker),
    ticker
  )

  return {
    chain: EvmChain.Ethereum,
    id: shouldBePresent(id, `${ticker} id`),
    ticker,
    decimals,
    logo,
  }
}

const sampleApprovals: TokenApproval[] = [
  {
    token: ethereumToken('USDT'),
    spender: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    allowance: unlimited,
  },
  {
    token: ethereumToken('USDC'),
    spender: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    allowance: unlimited,
  },
  {
    token: ethereumToken('USDC'),
    spender: '0x111111125421cA6dc452d289314280a0f8842A65',
    allowance: 500_000_000n,
  },
  {
    token: ethereumToken('DAI'),
    spender: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A21E',
    allowance: 2_000n * 10n ** 18n,
  },
  {
    token: ethereumToken('UNI'),
    spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
    allowance: unlimited,
  },
]

type PageProps = {
  initialChain: EvmChain
  approvals: Query<readonly TokenApproval[]>
}

function Page({ initialChain, approvals }: PageProps) {
  const { t } = useTranslation()
  const [chain, setChain] = useState(initialChain)

  return (
    // Extension popup size, so scrolling and layout match the real page.
    <VStack style={{ width: 360, height: 650 }}>
      <PageHeader
        primaryControls={
          <IconButton onClick={() => {}}>
            <ChevronLeftIcon />
          </IconButton>
        }
        title={t('token_approvals')}
      />
      <PageContent flexGrow scrollable>
        <TokenApprovalsContent
          value={chain}
          onChange={setChain}
          address="0xF42e7A1b9c3D5e6F708192a3B4c5D6e7F8091Ac5"
          approvals={chain === initialChain ? approvals : getResolvedQuery([])}
          onRevoke={() => {}}
        />
      </PageContent>
    </VStack>
  )
}

export const WithApprovals: Story = {
  render: () => (
    <Page
      initialChain={EvmChain.Ethereum}
      approvals={getResolvedQuery(sampleApprovals)}
    />
  ),
}

export const NoApprovals: Story = {
  render: () => (
    <Page initialChain={EvmChain.Base} approvals={getResolvedQuery([])} />
  ),
}

export const UnsupportedNetwork: Story = {
  render: () => (
    <Page initialChain={EvmChain.Blast} approvals={getResolvedQuery([])} />
  ),
}

export const Loading: Story = {
  render: () => (
    <Page initialChain={EvmChain.Ethereum} approvals={pendingQuery} />
  ),
}

export const LoadFailed: Story = {
  render: () => (
    <Page
      initialChain={EvmChain.Ethereum}
      approvals={{ data: undefined, isPending: false, error: new Error() }}
    />
  ),
}
