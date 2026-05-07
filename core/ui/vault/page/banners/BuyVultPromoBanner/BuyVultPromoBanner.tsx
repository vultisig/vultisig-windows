import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '@core/ui/storage/coins'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Text } from '@lib/ui/text'
import { areEqualCoins, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { useTranslation } from 'react-i18next'

import { BannerPromoCtaButton } from '../shared/BannerPromoCtaButton.styles'
import {
  BannerRoot,
  CloseButton,
  Content,
  IllustrationGlow,
  IllustrationImage,
  TextStack,
} from './BuyVultPromoBanner.styles'

const illustrationSrc = '/core/images/buy-vult-promo-illustration.png'

type BuyVultPromoBannerProps = {
  onDismiss: () => void
}

export const BuyVultPromoBanner = ({ onDismiss }: BuyVultPromoBannerProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { mutate: createCoin, isPending } = useCreateCoinMutation()
  const vaultCoins = useCurrentVaultCoins()

  const existingVultCoin = vaultCoins.find(coin => areEqualCoins(coin, vult))

  const openSwapToVult = () => {
    if (existingVultCoin) {
      navigate({
        id: 'swap',
        state: { toCoin: extractCoinKey(existingVultCoin) },
      })
      return
    }

    createCoin(vult, {
      onSuccess: coin => {
        navigate({
          id: 'swap',
          state: { toCoin: extractCoinKey(coin) },
        })
      },
      onError: () => {
        navigate({ id: 'swap', state: {} })
      },
    })
  }

  return (
    <BannerRoot data-testid="buy-vult-promo-banner">
      <CloseButton size="lg" onClick={onDismiss} aria-label={t('close')}>
        <CrossIcon style={{ fontSize: 16 }} />
      </CloseButton>

      <Content>
        <TextStack>
          <Text variant="caption" color="shy">
            {t('buy_vult_banner_title')}
          </Text>
          <Text size={14} weight={500} height={20 / 14} color="regular">
            {t('buy_vult_banner_subtitle')}
          </Text>
        </TextStack>

        <BannerPromoCtaButton disabled={isPending} onClick={openSwapToVult}>
          {t('buy_vult_banner_cta')}
        </BannerPromoCtaButton>
      </Content>

      <IllustrationGlow aria-hidden />
      <IllustrationImage src={illustrationSrc} alt="" decoding="async" />
    </BannerRoot>
  )
}
