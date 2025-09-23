import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useChainSpecificQuery } from '../../../../../chain/coin/queries/useChainSpecificQuery'
import { StartKeysignPrompt } from '../../../../../mpc/keysign/prompt/StartKeysignPrompt'
import { useCurrentVaultCoin } from '../../../../state/currentVaultCoins'
import { useReferralKeysignPayload } from '../../hooks/useReferralKeysignPayload'
import { useReferralSender } from '../../hooks/useReferralSender'
import { useCreateReferralForm } from '../../providers/CreateReferralFormProvider'
import { useReferralPayoutAsset } from '../../providers/ReferralPayoutAssetProvider'
import { useActivePoolsQuery } from '../../queries/useActivePoolsQuery'
import { buildCreateReferralMemo } from '../../utils/buildReferralMemos'
import { normaliseChainToMatchPoolChain } from '../EditReferral/EditReferralForm/config'
import { ReferralPageWrapper } from '../Referrals.styled'

export const CreateReferralVerify = ({ onBack }: OnBackProp) => {
  const { t } = useTranslation()
  const [coin] = useReferralPayoutAsset()
  const sender = useReferralSender()
  const { name: vaultName } = useCurrentVault()
  const { watch } = useCreateReferralForm()
  const referralAmount = watch('referralFeeAmount')
  const name = watch('referralName')

  const { data: allowedPools = [] } = useActivePoolsQuery()

  const preferredAsset = allowedPools.find(pool => {
    const [poolChain, tail] = pool.asset.split('.')
    const poolTicker = tail.split('-')[0]
    return (
      normaliseChainToMatchPoolChain(poolChain) ===
        normaliseChainToMatchPoolChain(coin.chain) &&
      poolTicker.toUpperCase() === coin.ticker.toUpperCase()
    )
  })?.asset

  const memo = buildCreateReferralMemo({
    name,
    thorAliasAddress: sender,
    preferredAsset: preferredAsset || undefined,
  })

  const thorchainCoin = useCurrentVaultCoin(chainFeeCoin.THORChain)
  const { chain, ticker } = thorchainCoin

  const { keysignPayload } = useReferralKeysignPayload({
    coin: thorchainCoin,
    memo,
    amount: referralAmount,
  })

  const chainSpecific = useChainSpecificQuery({
    coin: thorchainCoin,
    isDeposit: true,
  })

  if (!keysignPayload || !chainSpecific.data) {
    return (
      <CenterAbsolutely>
        <Spinner size="3em" />
      </CenterAbsolutely>
    )
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('send_overview')}
        hasBorder
      />
      <ReferralPageWrapper gap={12}>
        <TxOverviewPanel>
          <AmountWrapper gap={24}>
            <Text size={15} color="supporting">
              {t('you_are_sending')}
            </Text>
            <HStack alignItems="center" gap={8}>
              <CoinIcon coin={thorchainCoin} style={{ fontSize: 24 }} />
              <Text size={17}>
                {formatTokenAmount(referralAmount)}
                <Text as="span" color="shy">
                  {ticker}
                </Text>
              </Text>
            </HStack>
          </AmountWrapper>
          <TxOverviewRow>
            <RowTitle>{t('from')}</RowTitle>
            <Text size={14}>
              {vaultName}{' '}
              <Text size={14} as="span" color="shy">
                ({formatWalletAddress(sender)})
              </Text>
            </Text>
          </TxOverviewRow>
          <TxOverviewRow>
            <RowTitle>{t('network')}</RowTitle>
            <HStack gap={8}>
              <ChainEntityIcon
                value={getChainLogoSrc(chain)}
                style={{ fontSize: 16 }}
              />
              <Text size={14}>{chain}</Text>
            </HStack>
          </TxOverviewRow>

          <TxOverviewRow>
            <Text color="shy" size={14}>
              {t('est_network_fee')}
            </Text>
            <Text size={14}>
              {formatFee({ chain, amount: getFeeAmount(chainSpecific.data) })}
            </Text>
          </TxOverviewRow>
          <TxOverviewMemo value={memo} chain={chain} />
        </TxOverviewPanel>
        <VStack
          style={{
            marginTop: 'auto',
          }}
          gap={20}
        >
          <StartKeysignPrompt keysignPayload={{ keysign: keysignPayload }} />
        </VStack>
      </ReferralPageWrapper>
    </>
  )
}

const AmountWrapper = styled(VStack)`
  padding-bottom: 20px !important;
  margin-bottom: 12px;
`

const RowTitle = styled(Text)`
  font-size: 13px;
  color: ${getColor('textShy')};
`
