import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FeeAmount } from '../../../../../chain/feeQuote/amount'
import { StartKeysignPrompt } from '../../../../../mpc/keysign/prompt/StartKeysignPrompt'
import { useCurrentVaultCoin } from '../../../../state/currentVaultCoins'
import { useReferralSender } from '../../hooks/useReferralSender'
import { useEditReferralFormData } from '../../providers/EditReferralFormProvider'
import { useReferralPayoutAsset } from '../../providers/ReferralPayoutAssetProvider'
import { useActivePoolsQuery } from '../../queries/useActivePoolsQuery'
import { useReferralFeeQuoteQuery } from '../../queries/useReferralFeeQuoteQuery'
import { useReferralKeysignPayloadQuery } from '../../queries/useReferralKeysignPayloadQuery'
import { useUserValidThorchainNameQuery } from '../../queries/useUserValidThorchainNameQuery'
import {
  buildRenewalMemo,
  buildSetPreferredAssetMemo,
} from '../../utils/buildReferralMemos'
import { ReferralPageWrapper } from '../Referrals.styled'
import { normaliseChainToMatchPoolChain } from './EditReferralForm/config'

export const EditReferralVerify = ({ onBack }: OnBackProp) => {
  const { t } = useTranslation()
  const [coin] = useReferralPayoutAsset()
  const sender = useReferralSender()
  const { name: vaultName } = useCurrentVault()
  const { watch } = useEditReferralFormData()
  const referralAmount = watch('referralFeeAmount')

  const { data: allowedPools = [] } = useActivePoolsQuery()
  const { data: validNameDetails } = useUserValidThorchainNameQuery()

  const thorAliasAddress = validNameDetails?.aliases.find(
    a => a.chain.toUpperCase() === 'THOR'
  )?.address

  if (!thorAliasAddress) {
    throw new Error('Could not find your THOR‐chain alias address')
  }

  const preferredAsset = allowedPools.find(pool => {
    const [poolChain, tail] = pool.asset.split('.')
    const poolTicker = tail.split('-')[0]
    return (
      normaliseChainToMatchPoolChain(poolChain) ===
        normaliseChainToMatchPoolChain(coin.chain) &&
      poolTicker.toUpperCase() === coin.ticker.toUpperCase()
    )
  })?.asset

  const name = shouldBePresent(validNameDetails?.name)
  const wantsAssetChange =
    !!preferredAsset && preferredAsset !== validNameDetails?.preferred_asset

  const memo = wantsAssetChange
    ? buildSetPreferredAssetMemo({
        name,
        thorAliasAddress,
        preferredAsset: shouldBePresent(preferredAsset),
      })
    : buildRenewalMemo({ name, thorAliasAddress })

  const thorchainCoin = useCurrentVaultCoin(chainFeeCoin.THORChain)

  const { chain, ticker } = thorchainCoin

  const feeQuoteQuery = useReferralFeeQuoteQuery()

  const { isPending, error, data } = useReferralKeysignPayloadQuery({
    memo,
    amount: referralAmount,
  })

  const startKeysignPromptProps = useMemo(() => {
    if (isPending) {
      return {
        disabledMessage: t('loading'),
      }
    }

    if (error) {
      return {
        disabledMessage: extractErrorMsg(error),
      }
    }

    return {
      keysignPayload: { keysign: data },
    }
  }, [data, error, isPending, t])
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
              <Text size={17}>{formatAmount(referralAmount, { ticker })}</Text>
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
            <FeeAmount feeQuoteQuery={feeQuoteQuery} chain={chain} />
          </TxOverviewRow>
          <TxOverviewMemo value={memo} chain={chain} />
        </TxOverviewPanel>
        <VStack
          style={{
            marginTop: 'auto',
          }}
          gap={20}
        >
          <StartKeysignPrompt {...startKeysignPromptProps} />
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
