import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { useClaimableUtxosQuery } from '../hooks/useClaimableUtxosQuery'
import { useClaimWithProofDisabledQuery } from '../hooks/useClaimWithProofDisabledQuery'
import {
  BannerCta,
  BannerEllipseGlass,
  BannerEllipseGlow,
  BannerEllipseOuter,
  BannerRoot,
  BannerTextStack,
  BtcStickerBottomLeft,
  BtcStickerMidLeft,
  BtcStickerMidRight,
  BtcStickerTopLeft,
  BtcStickerTopRight,
} from './QbtcClaimBanner.styles'

/** Promotional banner shown on the BTC chain detail page that takes the user
 * into the QBTC claim flow. Visible for any vault holding an MLDSA key with at
 * least one claimable UTXO, where ClaimWithProof is not globally disabled - the
 * flow itself co-signs with the server or a second device depending on the
 * vault, so neither kind is excluded here. */
export const QbtcClaimBanner = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)

  const utxosQuery = useClaimableUtxosQuery({ btcAddress })
  const disabledQuery = useClaimWithProofDisabledQuery()

  const hasMldsaKey = Boolean(vault.publicKeyMldsa)
  const claimEnabled = disabledQuery.data === false
  const hasClaimableUtxos = (utxosQuery.data?.length ?? 0) > 0

  if (!hasMldsaKey || !claimEnabled || !hasClaimableUtxos) {
    return null
  }

  return (
    <BannerRoot data-testid="qbtc-claim-banner">
      <BannerEllipseOuter aria-hidden />
      <BannerEllipseGlow aria-hidden />
      <BannerEllipseGlass aria-hidden />
      <BtcStickerMidLeft aria-hidden />
      <BtcStickerTopLeft aria-hidden />
      <BtcStickerBottomLeft aria-hidden />
      <BtcStickerTopRight aria-hidden />
      <BtcStickerMidRight aria-hidden />
      <BannerTextStack>
        <Text variant="caption" color="shy">
          {t('qbtc_claim_banner_title')}
        </Text>
        <Text size={22} weight={500} height={24 / 22} color="regular">
          {t('qbtc_claim_banner_subtitle')}
        </Text>
      </BannerTextStack>
      <BannerCta onClick={() => navigate({ id: 'qbtcClaim' })}>
        {t('qbtc_claim_banner_cta')}
      </BannerCta>
    </BannerRoot>
  )
}
