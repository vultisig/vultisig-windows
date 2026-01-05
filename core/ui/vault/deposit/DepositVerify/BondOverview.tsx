import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BlockaidLogo } from '@core/ui/chain/security/blockaid/BlockaidLogo'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { TransactionOverviewAmount } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewAmount'
import { TransactionOverviewCard } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewCard'
import { TransactionOverviewItem } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewItem'
import { useIsBlockaidEnabledQuery } from '@core/ui/storage/blockaid'
import { DepositConfirmButton } from '@core/ui/vault/deposit/DepositConfirmButton'
import { useDepositMemo } from '@core/ui/vault/deposit/hooks/useDepositMemo'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositData } from '@core/ui/vault/deposit/state/data'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { HStack } from '@lib/ui/layout/Stack'
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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const BondOverview = ({ onBack }: OnBackProp) => {
  const { t } = useTranslation()
  const depositData = useDepositData()
  const [coin] = useDepositCoin()
  const memo = useDepositMemo()
  const { name: vaultName } = useCurrentVault()
  const vaultAddress = useCurrentVaultAddress(coin.chain)
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()
  const { data: isBlockaidEnabled } = useIsBlockaidEnabledQuery()

  const rawAmount = depositData?.amount
  const amountValue =
    typeof rawAmount === 'number' ? rawAmount : Number(rawAmount ?? 0)
  const fallbackAmount = Number.isFinite(amountValue) ? amountValue : 0

  const nodeAddress = (depositData?.nodeAddress as string | undefined) ?? ''

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

        <TransactionOverviewCard>
          <TransactionOverviewAmount
            label={t('you_are_bonding')}
            coin={coin}
            fallbackAmount={fallbackAmount}
            keysignPayloadQuery={keysignPayloadQuery}
          />
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
            label={t('to')}
            value={
              nodeAddress ? (
                <MiddleTruncate
                  size={14}
                  text={nodeAddress}
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
            label={t('memo')}
            value={
              memo ? (
                <MiddleTruncate
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
        </TransactionOverviewCard>
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
  color: #c9d6e8;
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
  color: #c9d6e8;
  font-family: 'Brockmann', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
  margin-right: 6px;
  white-space: nowrap;
  text-align: center;
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
