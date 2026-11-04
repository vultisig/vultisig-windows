import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { InputProps } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { isUnlimitedAllowance } from './core/isUnlimitedAllowance'
import { shortenEvmAddress } from './core/shortenEvmAddress'
import { TokenApproval } from './core/TokenApproval'
import { isTokenApprovalsSupportedChain } from './core/tokenApprovalsChains'
import { EvmAddressText } from './EvmAddressText'
import { TokenApprovalRow } from './TokenApprovalRow'
import { TokenApprovalsNetworkSelector } from './TokenApprovalsNetworkSelector'
import { TokenApprovalsStatePanel } from './TokenApprovalsStatePanel'

type TokenApprovalsContentProps = InputProps<EvmChain> & {
  address: string
  approvals: Query<readonly TokenApproval[]>
  onRevoke: (approval: TokenApproval) => void
}

/**
 * Body of the Token Approvals page for one EVM network: the vault address
 * and network picker, then the allowances (or an empty / unsupported message).
 * Takes all data as props so every state can be shown in Storybook.
 */
export const TokenApprovalsContent = ({
  value: chain,
  onChange,
  address,
  approvals,
  onRevoke,
}: TokenApprovalsContentProps) => {
  const { t } = useTranslation()
  const [isNetworkPickerOpen, setIsNetworkPickerOpen] = useState(false)
  const openNetworkPicker = () => setIsNetworkPickerOpen(true)

  const isSupported = isTokenApprovalsSupportedChain(chain)

  return (
    <VStack gap={12}>
      <HStack alignItems="center" justifyContent="space-between" gap={8}>
        <EvmAddressText size={13} weight="500" color="supporting" cropped>
          {shortenEvmAddress(address)}
        </EvmAddressText>
        <TokenApprovalsNetworkSelector
          value={chain}
          onChange={onChange}
          isOpen={isNetworkPickerOpen}
          onOpenChange={setIsNetworkPickerOpen}
        />
      </HStack>
      {!isSupported ? (
        <TokenApprovalsStatePanel
          icon={<CircleInfoIcon />}
          title={t('token_approvals_unsupported_title', {
            chain: getChainDisplayName(chain),
          })}
          description={t('token_approvals_unsupported_description')}
          onSwitchNetwork={openNetworkPicker}
        />
      ) : (
        <MatchQuery
          value={approvals}
          pending={() => (
            <HStack justifyContent="center">
              <Spinner />
            </HStack>
          )}
          error={() => <Text color="danger">{t('failed_to_load')}</Text>}
          success={approvals => {
            if (approvals.length === 0) {
              return (
                <TokenApprovalsStatePanel
                  icon={<ShieldCheckIcon />}
                  title={t('token_approvals_empty_title', {
                    chain: getChainDisplayName(chain),
                  })}
                  description={t('token_approvals_empty_description')}
                  onSwitchNetwork={openNetworkPicker}
                />
              )
            }

            const unlimitedCount = approvals.filter(({ allowance }) =>
              isUnlimitedAllowance(allowance)
            ).length

            return (
              <>
                <Text size={12} color="shy">
                  {t('token_approvals_count', { count: approvals.length })}
                  {unlimitedCount > 0
                    ? ` · ${t('token_approvals_unlimited_count', { count: unlimitedCount })}`
                    : null}
                </Text>
                <List>
                  {approvals.map(approval => (
                    <TokenApprovalRow
                      key={`${approval.token.id}:${approval.spender}`}
                      value={approval}
                      onRevoke={() => onRevoke(approval)}
                    />
                  ))}
                </List>
                <InfoBlock>{t('token_approvals_disconnect_note')}</InfoBlock>
              </>
            )
          }}
        />
      )}
    </VStack>
  )
}

const List = styled(VStack)`
  ${borderRadius.md};
  border: 1px solid ${getColor('foregroundExtra')};
  overflow: hidden;
`
