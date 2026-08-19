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

  const banner = (
    id: Exclude<BannerId, 'agentNavigationCoachmark'>,
    caption: string,
    title: string,
    onClick: () => void
  ): HomePromoBannerEntry => {
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
          banner('migrate', t('sign_faster'), t('upgrade_now_prompt'), () =>
            navigate({ id: 'migrateVault' })
          ),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner(
            'rujiraStaking',
            t('rujira_banner_subtitle'),
            t('rujira_banner_title'),
            () => navigate({ id: 'defi', state: {} })
          ),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner(
            'followOnX',
            t('follow_banner_subtitle'),
            t('follow_banner_title'),
            () =>
              window.open(vultisigTwitterUrl, '_blank', 'noopener,noreferrer')
          ),
        ]
      : []),
    ...(vault.isBackedUp
      ? []
      : [
          banner(
            'vaultBackup',
            t('vault_backup_banner_subtitle'),
            t('vault_backup_banner_title'),
            () => navigate({ id: 'vaultBackup' })
          ),
        ]),
    ...(isVultisigBrand && !friendReferral
      ? [
          banner(
            'referralCode',
            t('referral_banner_subtitle'),
            t('referral_banner_title'),
            () => navigate({ id: 'referral' })
          ),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner(
            'buyVultPromo',
            t('buy_vult_banner_title'),
            t('buy_vult_banner_subtitle'),
            openSwapToVult
          ),
        ]
      : []),
    ...(isVultisigBrand
      ? [
          banner(
            'kamino',
            t('kamino_banner_subtitle'),
            t('kamino_banner_title'),
            // Destination pending the Solana Kamino integration - see #4681.
            () => {}
          ),
        ]
      : []),
  ]
}
