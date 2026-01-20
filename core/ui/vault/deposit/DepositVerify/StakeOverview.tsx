import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BlockaidLogo } from '@core/ui/chain/security/blockaid/BlockaidLogo'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { TransactionOverviewAmount } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewAmount'
import { TransactionOverviewItem } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewItem'
import { useIsBlockaidEnabledQuery } from '@core/ui/storage/blockaid'
import { DepositConfirmButton } from '@core/ui/vault/deposit/DepositConfirmButton'
import { useDepositMemo } from '@core/ui/vault/deposit/hooks/useDepositMemo'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { useDepositAction } from '@core/ui/vault/deposit/providers/DepositActionProvider'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositData } from '@core/ui/vault/deposit/state/data'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const StakeOverview = ({ onBack }: OnBackProp) => {
  const { t } = useTranslation()
  const depositData = useDepositData()
  const [coin] = useDepositCoin()
  const [action] = useDepositAction()
  const memo = useDepositMemo()
  const { name: vaultName } = useCurrentVault()
  const vaultAddress = useCurrentVaultAddress(coin.chain)
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()
  const { data: isBlockaidEnabled } = useIsBlockaidEnabledQuery()

  const isUnstake = action === 'unstake'
  const actionLabel = isUnstake
    ? (t('you_are_unstaking') as string)
    : (t('you_are_staking') as string)

  // Check if this is a native TCY unstake - the memo will be like 'tcy-:5000'
  // In this case, the transaction amount is 0 and the percentage is in the memo
  const isNativeTcyUnstake = isUnstake && memo?.startsWith('tcy-:')

  const rawAmount = depositData?.amount
  const amountValue =
    typeof rawAmount === 'number' ? rawAmount : Number(rawAmount ?? 0)
  const fallbackAmount = Number.isFinite(amountValue) ? amountValue : 0

  // For native TCY unstaking, the payload.toAmount is '0' because the amount is
  // encoded in the memo as a percentage. We need to use the form amount instead.
  const getPayloadAmount = useCallback(
    (payload: KeysignPayload) => {
      const payloadAmount = payload.toAmount
      // If payload amount is 0 or empty, use the form amount (converted to chain units)
      if (!payloadAmount || payloadAmount === '0') {
        return toChainAmount(fallbackAmount, coin.decimals).toString()
      }
      return payloadAmount
    },
    [fallbackAmount, coin.decimals]
  )

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('overview')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        {isBlockaidEnabled && (
          <BlockaidStatus>
            <SuccessIconWrapper>
              <CheckmarkIcon />
            </SuccessIconWrapper>
            <BlockaidLabel as="span">
              {t('transaction_scanned_by', { provider: '' }).trim()}
            </BlockaidLabel>
            <BlockaidLogoWrapper>
              <BlockaidLogo />
            </BlockaidLogoWrapper>
          </BlockaidStatus>
        )}

        <List border="gradient" radius={16}>
          {/* Hide amount row for native TCY unstake when fallback is 0, as the actual
              amount is determined by THORChain based on the percentage in the memo */}
          {!(isNativeTcyUnstake && fallbackAmount === 0) && (
            <TransactionOverviewAmount
              label={actionLabel}
              coin={coin}
              fallbackAmount={fallbackAmount}
              keysignPayloadQuery={keysignPayloadQuery}
              getPayloadAmount={getPayloadAmount}
            />
          )}
          <TransactionOverviewItem
            label={t('from')}
            value={
              <HStack alignItems="center" gap={8}>
                <Text as="span" size={14} weight={600}>
                  {vaultName}
                </Text>
                <Text as="span" color="shy" size={14} weight={500}>
                  ({formatWalletAddress(vaultAddress)})
                </Text>
              </HStack>
            }
          />
          <TransactionOverviewItem
            label={t('memo')}
            value={
              memo ? (
                <StyledTruncate
                  size={14}
                  text={memo}
                  weight={500}
                  width={220}
                />
              ) : (
                <Text as="span" size={14} color="shy">
                  —
                </Text>
              )
            }
          />
          <TransactionOverviewItem
            label={t('network')}
            value={
              <HStack alignItems="center" gap={6}>
                <ChainEntityIcon
                  value={getChainLogoSrc(coin.chain)}
                  style={{ fontSize: 16 }}
                />
                <Text size={14} weight={500}>
                  {coin.chain}
                </Text>
              </HStack>
            }
          />
          <TransactionOverviewItem
            label={t('est_network_fee')}
            value={
              <MatchQuery
                value={keysignPayloadQuery}
                pending={() => <Spinner />}
                success={payload => (
                  <KeysignFeeAmount keysignPayload={payload} />
                )}
                error={() => (
                  <Text as="span" size={14} color="shy">
                    —
                  </Text>
                )}
              />
            }
          />
        </List>
      </PageContent>
      <PageFooter>
        <DepositConfirmButton />
      </PageFooter>
    </>
  )
}

const BlockaidStatus = styled(HStack)`
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  background: transparent;
  border: none;
  color: ${getColor('textShy')};
  font-family: 'Brockmann', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
  white-space: nowrap;
`

const SuccessIconWrapper = styled.div`
  color: ${getColor('success')};
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 2px;
`

const BlockaidLabel = styled(Text)`
  color: ${getColor('textShy')};
  font-family: 'Brockmann', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
  margin-right: 6px;
  white-space: nowrap;
  text-align: center;
`

const StyledTruncate = styled(MiddleTruncate)`
  justify-content: flex-end;
`

const BlockaidLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
  height: 10px;
  width: 55px;

  svg {
    width: 55px;
    height: 10px;
  }
`
