import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { readRevokeKeysignPayload } from '../core/readRevokeKeysignPayload'
import { TokenApproval } from '../core/TokenApproval'
import { EvmAddressText } from '../EvmAddressText'
import { RevokeApprovalDetailRow } from './RevokeApprovalDetailRow'
import { RevokeFeeAmount } from './RevokeFeeAmount'
import { useRevokeApprovalKeysignPayloadQuery } from './useRevokeApprovalKeysignPayloadQuery'

const explanationKey = {
  erc20: 'revoke_approval_explanation',
  permit2: 'revoke_approval_permit2_explanation',
  splDelegate: 'revoke_approval_spl_explanation',
} as const satisfies Record<TokenApproval['kind'], string>

/**
 * Verify screen for revoking one approval. The spender shown is read back
 * from the built payload, and the payload query itself refuses to produce
 * bytes that do not decode to exactly this revoke, on every rebuild.
 */
export const RevokeTokenApprovalPage = () => {
  const { t } = useTranslation()
  const [{ approval }] = useCoreViewState<'revokeTokenApproval'>()
  const { token } = approval

  const keysignPayloadQuery = useRevokeApprovalKeysignPayloadQuery(approval)
  const { data } = keysignPayloadQuery
  const intent = data ? readRevokeKeysignPayload(data) : null

  // An SPL Revoke clears any delegate, so only the EVM spender is in the signed bytes.
  const spender =
    intent && intent.kind !== 'splDelegate' ? intent.spender : approval.spender

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('revoke_approval')}
        hasBorder
      />
      <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
        <VStack gap={16}>
          <Card gap={16}>
            <HStack alignItems="center" gap={12}>
              <CoinIcon coin={token} style={{ fontSize: 32 }} />
              <Text size={16} weight={500} color="contrast">
                {token.ticker}
              </Text>
            </HStack>
            <LineSeparator kind="regular" />
            <VStack gap={4}>
              <Text size={13} color="shy">
                {approval.kind === 'splDelegate'
                  ? t('token_approvals_delegate')
                  : t('spender')}
              </Text>
              <EvmAddressText size={13} weight={500} color="contrast">
                {spender}
              </EvmAddressText>
            </VStack>
            {approval.kind === 'permit2' ? (
              <RevokeApprovalDetailRow
                label={t('token_approvals_via')}
                value="Permit2"
              />
            ) : null}
            <RevokeApprovalDetailRow
              label={t('revoke_approval_new_allowance')}
              value={`0 ${token.ticker}`}
            />
            <RevokeApprovalDetailRow
              label={t('network')}
              value={getChainDisplayName(token.chain)}
            />
            <RevokeApprovalDetailRow
              label={t('network_fee')}
              value={
                <MatchQuery
                  value={keysignPayloadQuery}
                  pending={() => t('loading')}
                  error={() => t('failed_to_load')}
                  success={payload => <RevokeFeeAmount value={payload} />}
                />
              }
            />
          </Card>
          <Text size={12} color="shy">
            {t(explanationKey[approval.kind])}
          </Text>
        </VStack>
      </VerifyKeysignStart>
    </>
  )
}

const Card = styled(VStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.md};
  padding: 16px;
`
