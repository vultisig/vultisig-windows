import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Query } from '@lib/ui/query/Query'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainApprovals } from './core/ChainApprovals'
import { isUnlimitedAllowance } from './core/isUnlimitedAllowance'
import { TokenApproval } from './core/TokenApproval'
import { TokenApprovalsChain } from './core/tokenApprovalsChains'
import { TokenApprovalRow } from './TokenApprovalRow'
import { TokenApprovalsStatePanel } from './TokenApprovalsStatePanel'

type ChainQuery = {
  chain: TokenApprovalsChain
  query: Query<ChainApprovals>
  /** True while a lookup runs, including a refresh of a list restored from storage. */
  isFetching: boolean
}

type TokenApprovalsContentProps = {
  chains: ChainQuery[]
  /** The vault's chains whose approvals cannot be listed yet. */
  uncheckedChains: Chain[]
  onRevoke: (approval: TokenApproval) => void
}

const approvalKey = (approval: TokenApproval) =>
  approval.kind === 'splDelegate'
    ? approval.tokenAccount
    : `${approval.kind}:${approval.token.chain}:${approval.token.id}:${approval.spender}`

const chainNames = (chains: Chain[]) =>
  chains.map(getChainDisplayName).join(', ')

/**
 * Body of the approvals page: every approval found so far across the vault's
 * chains, unlimited ones first, with the chains still loading, failed, only
 * partly checked or not checked at all named below. Takes all data as props
 * so every state can be shown in Storybook.
 */
export const TokenApprovalsContent = ({
  chains,
  uncheckedChains,
  onRevoke,
}: TokenApprovalsContentProps) => {
  const { t } = useTranslation()

  const approvals = chains
    .flatMap(({ query }) => query.data?.approvals ?? [])
    .sort(
      (a, b) =>
        Number(isUnlimitedAllowance(b)) - Number(isUnlimitedAllowance(a)) ||
        a.token.ticker.localeCompare(b.token.ticker)
    )
  const chainsWhere = (test: (query: ChainQuery['query']) => boolean) =>
    chains.filter(({ query }) => test(query)).map(({ chain }) => chain)
  const pending = chains
    .filter(({ query, isFetching }) => query.isPending || isFetching)
    .map(({ chain }) => chain)
  const failed = chainsWhere(query => query.error !== null)
  const partial = chainsWhere(query => query.data?.isComplete === false)
  const unlimitedCount = approvals.filter(isUnlimitedAllowance).length

  return (
    <VStack gap={12}>
      {approvals.length === 0 && pending.length === 0 && failed.length === 0 ? (
        <TokenApprovalsStatePanel
          icon={<ShieldCheckIcon />}
          title={t('token_approvals_empty_title')}
          description={t('token_approvals_empty_description')}
        />
      ) : null}
      {approvals.length > 0 ? (
        <>
          <Text size={12} color="shy">
            {t('token_approvals_count', { count: approvals.length })}
            {unlimitedCount > 0
              ? ` · ${t('token_approvals_unlimited_count', { count: unlimitedCount })}`
              : null}
          </Text>
          <Card gap={12}>
            {approvals.map((approval, index) => (
              <Fragment key={approvalKey(approval)}>
                {index > 0 ? <LineSeparator kind="regular" /> : null}
                <TokenApprovalRow
                  value={approval}
                  onRevoke={() => onRevoke(approval)}
                />
              </Fragment>
            ))}
          </Card>
        </>
      ) : null}
      {pending.length > 0 ? (
        <HStack alignItems="center" gap={8}>
          <Spinner />
          <Text size={12} color="shy">
            {t('token_approvals_checking', { chains: chainNames(pending) })}
          </Text>
        </HStack>
      ) : null}
      {failed.length > 0 ? (
        <Text size={12} color="danger">
          {t('token_approvals_failed', { chains: chainNames(failed) })}
        </Text>
      ) : null}
      {partial.length > 0 ? (
        <Text size={12} color="danger">
          {t('token_approvals_partial', { chains: chainNames(partial) })}
        </Text>
      ) : null}
      {uncheckedChains.length > 0 ? (
        <Text size={12} color="shy">
          {t('token_approvals_not_checked', {
            chains: chainNames(uncheckedChains),
          })}
        </Text>
      ) : null}
      <InfoBlock>{t('token_approvals_disconnect_note')}</InfoBlock>
    </VStack>
  )
}

const Card = styled(VStack)`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.lg};
  padding: 16px 14px;
`
