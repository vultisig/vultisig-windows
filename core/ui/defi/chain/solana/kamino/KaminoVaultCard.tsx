import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CircleMinusIcon } from '@lib/ui/icons/CircleMinusIcon'
import { CirclePlusIcon } from '@lib/ui/icons/CirclePlusIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text, TextColor } from '@lib/ui/text'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { KaminoRiskTier } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { KaminoMarkIcon } from './KaminoMarkIcon'
import { KaminoPositionFigure } from './KaminoPositionFigure'
import { KaminoVaultLogos } from './KaminoVaultLogos'

type KaminoVaultCardProps = {
  info: KaminoVaultInfo
  /** The vault's underlying coin, for the logo and the fiat conversion. */
  coin: Coin
  /** USD price of the underlying token, `0` when it could not be read. */
  priceUsd: number
  /**
   * What is known about the owner's position in this vault. A balance still
   * being read is NOT an empty vault: reporting one as the other would tell a
   * depositor their funds are gone, so the three states stay distinct.
   */
  position: KaminoCardPosition
}

/** The owner's position in one vault, as far as the balance read got. */
export type KaminoCardPosition =
  | { status: 'pending' }
  | { status: 'unavailable' }
  | {
      status: 'settled'
      /** Value in the underlying token; `0` is a confirmed empty vault. */
      tokenAmount: number
      /** Lifetime PnL in the underlying token, absent when unreadable. */
      pnlToken?: number
    }

/**
 * The risk tier is curation, not API data — Kamino exposes no risk field — so
 * the label comes from the registry's tier and is deliberately never phrased
 * as government-backed: the private-credit vault lends against tokenized
 * reinsurance, receivables and corporate bonds.
 */
const riskTierLabelKey = {
  conservative: 'kamino_earn_risk_conservative',
  privateCredit: 'kamino_earn_risk_private_credit',
} as const satisfies Record<KaminoRiskTier, string>

// A caption beside the name rather than a filled pill: the tier qualifies the
// vault's identity, and only private credit is a caveat worth the alert hue.
const riskTierColor = {
  conservative: 'shy',
  privateCredit: 'warning',
} as const satisfies Record<KaminoRiskTier, TextColor>

/**
 * One curated Kamino Earn vault on the Solana DeFi tab: the vault's live name
 * and risk tier, the protocol it runs on, its 30-day APY, and — when the vault
 * holds one — the position's deposited and earned figures with the actions
 * that move them.
 */
export const KaminoVaultCard = ({
  info,
  coin,
  priceUsd,
  position,
}: KaminoVaultCardProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const navigate = useCoreNavigate()
  const { riskTier } = info.descriptor
  const hasPosition = position.status === 'settled' && position.tokenAmount > 0

  // Withdraw stays reachable while the read is pending or failed: a position
  // must never be made unreachable by a request that did not land.
  const isConfirmedEmpty = position.status === 'settled' && !hasPosition

  const toFiat = (amount: number) =>
    priceUsd > 0 ? formatFiatAmount(amount * priceUsd) : undefined

  const goToDeposit = () =>
    navigate({
      id: 'kaminoDeposit',
      state: { vaultAddress: info.descriptor.address },
    })

  return (
    <Container gap={12}>
      <HStack gap={8} alignItems="center">
        <KaminoVaultLogos coin={coin} />
        <Identity gap={2}>
          <HStack gap={8} alignItems="center" justifyContent="space-between">
            <VaultName weight={500} cropped>
              {info.name}
            </VaultName>
            <RiskCaption size={12} color={riskTierColor[riskTier]}>
              {t(riskTierLabelKey[riskTier])}
            </RiskCaption>
          </HStack>
          <HStack gap={4} alignItems="center">
            <IconWrapper size={14}>
              <KaminoMarkIcon />
            </IconWrapper>
            <Text size={12} color="shy">
              {t('kamino_earn_protocol')}
            </Text>
          </HStack>
        </Identity>
      </HStack>

      {position.status === 'settled' && hasPosition ? (
        <>
          <KaminoPositionFigure
            label={t('kamino_earn_deposited', {
              amount: formatAmount(position.tokenAmount, {
                ticker: coin.ticker,
              }),
            })}
            fiat={toFiat(position.tokenAmount)}
          />
          {position.pnlToken !== undefined ? (
            <KaminoPositionFigure
              label={t('kamino_earn_earned', {
                amount: formatAmount(position.pnlToken, {
                  ticker: coin.ticker,
                }),
              })}
              fiat={toFiat(position.pnlToken)}
            />
          ) : null}
        </>
      ) : null}

      <HStack justifyContent="space-between" alignItems="center" gap={8}>
        <HStack gap={6} alignItems="center">
          <IconWrapper size={16} color="textShy">
            <PercentIcon />
          </IconWrapper>
          <Text size={13} color="shy">
            {t('apy')}
          </Text>
        </HStack>
        <Text size={13} color="success">
          {`${(info.apy30d * 100).toFixed(2)}%`}
        </Text>
      </HStack>

      {isConfirmedEmpty ? (
        <Button icon={<CirclePlusIcon />} onClick={goToDeposit}>
          {t('kamino_earn_card_deposit')}
        </Button>
      ) : (
        <>
          <LineSeparator kind="regular" />
          <HStack gap={8}>
            <Button
              kind="secondary"
              icon={<CircleMinusIcon />}
              onClick={() =>
                navigate({
                  id: 'kaminoWithdraw',
                  state: { vaultAddress: info.descriptor.address },
                })
              }
            >
              {t('kamino_earn_card_withdraw')}
            </Button>
            <Button icon={<CirclePlusIcon />} onClick={goToDeposit}>
              {t('kamino_earn_card_deposit')}
            </Button>
          </HStack>
        </>
      )}
    </Container>
  )
}

const Container = styled(VStack)`
  padding: 16px;
  ${borderRadius.xl};
  background: rgba(255, 255, 255, 0.04);
`

const Identity = styled(VStack)`
  flex: 1;
  min-width: 0;
`

const VaultName = styled(Text)`
  min-width: 0;
`

// The tier is the shorter, more surprising half of the line, so the name is
// what gives way when the two do not fit.
const RiskCaption = styled(Text)`
  flex-shrink: 0;
`
