import { banxaSupportedChains, getBanxaBuyUrl } from '@core/chain/banxa'
import { CoinKey } from '@core/chain/coin/Coin'
import { useCore } from '@core/ui/state/core'
import { SecondaryActionWrapper } from '@core/ui/vault/components/PrimaryActions.styled'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

type BuyPromptProps = {
  coin: CoinKey
}

export const BuyPrompt = ({ coin }: BuyPromptProps) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { ticker, address } = useCurrentVaultCoin(coin)

  const { chain } = coin

  if (!isOneOf(chain, banxaSupportedChains)) {
    return null
  }

  const url = getBanxaBuyUrl({ address, ticker, chain })

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper onClick={() => openUrl(url)}>
        <DollarIcon />
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('buy')}
      </Text>
    </VStack>
  )
}
