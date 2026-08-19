import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { vultisigTwitterUrl } from '@core/ui/settings/constants'
import { useCreateCoinMutation } from '@core/ui/storage/coins'
import { BannerId } from '@core/ui/storage/dismissedBanners'
import { useFriendReferralQuery } from '@core/ui/storage/referrals'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { areEqualCoins, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { currentProductBrand } from '../../../product/brand'
import { homePromoBannerVisuals } from './homePromoBanners'
import { HomePromoBanner } from './shared/HomePromoBanner'
import { HomePromoBannerIcon } from './shared/HomePromoBannerIcon'

type HomePromoBannerEntry = {
  id: BannerId
  component: (props: { onDismiss: () => void }) => ReactNode
}

type BannerInput = {
  id: Exclude<BannerId, 'agentNavigationCoachmark'>
  /** The small line above the title. */
  caption: string
  /** The emphasised line the banner leads with. */
  title: string
  onClick: () => void
}

/**
 * Builds the home carousel's banner list. Each entry is gated on the state it
 * advertises - a vault already backed up has nothing to back up - so the
 * carousel only ever shows banners that still have something to offer.
 */
export const useHomePromoBanners = (): HomePromoBannerEntry[] => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const vaultCoins = useCurrentVaultCoins()
  const { mutate: createCoin } = useCreateCoinMutation()
  const { data: friendReferral } = useFriendReferralQuery(getVaultId(vault))

  const isVultisigBrand = currentProductBrand === 'vultisig'

  const openSwapToVult = () => {
    const existingVultCoin = vaultCoins.find(coin => areEqualCoins(coin, vult))

    if (existingVultCoin) {
      navigate({
        id: 'swap',
        state: { toCoin: extractCoinKey(existingVultCoin) },
      })
      return
    }

    createCoin(vult, {
      onSuccess: coin =>
        navigate({ id: 'swap', state: { toCoin: extractCoinKey(coin) } }),
      onError: () => navigate({ id: 'swap', state: {} }),
    })
  }

  const banner = ({
    id,
    caption,
    title,
    onClick,
  }: BannerInput): HomePromoBannerEntry => {
    const visuals = homePromoBannerVisuals[id]

    return {
      id,
      component: ({ onDismiss }) => (
        <HomePromoBanner
          caption={caption}
          title={title}
          accent={visuals.accent}
          artSrc={visuals.artSrc}
          icon={<HomePromoBannerIcon visuals={visuals} />}
          onClick={onClick}
          onDismiss={onDismiss}
          testId={`${id}-promo-banner`}
        />
      ),
    }
  }

  return [
    ...(vault.libType !== 'DKLS'
      ? [
          banner({
            id: 'migrate',
            caption: t('sign_faster'),
            title: t('upgrade_now_prompt'),
            onClick: () => navigate({ id: 'migrateVault' }),
          }),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner({
            id: 'rujiraStaking',
            caption: t('rujira_banner_caption'),
            title: t('rujira_banner_title'),
            onClick: () => navigate({ id: 'defi', state: {} }),
          }),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner({
            id: 'followOnX',
            caption: t('follow_banner_caption'),
            title: t('follow_banner_title'),
            onClick: () =>
              window.open(vultisigTwitterUrl, '_blank', 'noopener,noreferrer'),
          }),
        ]
      : []),
    ...(vault.isBackedUp
      ? []
      : [
          banner({
            id: 'vaultBackup',
            caption: t('vault_backup_banner_caption'),
            title: t('vault_backup_banner_title'),
            onClick: () => navigate({ id: 'vaultBackup' }),
          }),
        ]),
    ...(isVultisigBrand && !friendReferral
      ? [
          banner({
            id: 'referralCode',
            caption: t('referral_banner_caption'),
            title: t('referral_banner_title'),
            onClick: () => navigate({ id: 'referral' }),
          }),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner({
            id: 'buyVultPromo',
            caption: t('buy_vult_banner_caption'),
            title: t('buy_vult_banner_title'),
            onClick: openSwapToVult,
          }),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner({
            id: 'kamino',
            caption: t('kamino_banner_caption'),
            title: t('kamino_banner_title'),
            // Destination pending the Solana Kamino integration - see #4685.
            onClick: () => {},
          }),
        ]
      : []),
  ]
}
