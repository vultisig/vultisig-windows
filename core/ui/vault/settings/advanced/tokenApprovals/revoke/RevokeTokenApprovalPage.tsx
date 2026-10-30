import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { EvmAddressText } from '../EvmAddressText'
import { RevokeApprovalDetailRow } from './RevokeApprovalDetailRow'
import { useRevokeApprovalKeysignPayloadQuery } from './useRevokeApprovalKeysignPayloadQuery'

/**
 * Verify screen for revoking one allowance: shows the token, spender and
 * network, then hands the `approve(spender, 0)` payload to the standard
 * keysign flow.
 */
export const RevokeTokenApprovalPage = () => {
  const { t } = useTranslation()
  const [{ token, spender }] = useCoreViewState<'revokeTokenApproval'>()

  const keysignPayloadQuery = useRevokeApprovalKeysignPayloadQuery({
    chain: token.chain,
    tokenAddress: token.id,
    spender,
  })

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
            <Divider />
            <VStack gap={4}>
              <Text size={13} color="shy">
                {t('spender')}
              </Text>
              <EvmAddressText size={13} weight={500} color="contrast">
                {spender}
              </EvmAddressText>
            </VStack>
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
                  success={keysignPayload => (
                    <KeysignFeeAmount keysignPayload={keysignPayload} />
                  )}
                />
              }
            />
          </Card>
          <Text size={12} color="shy">
            {t('revoke_approval_explanation')}
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

const Divider = styled.div`
  height: 1px;
  background: ${getColor('foregroundExtra')};
`
