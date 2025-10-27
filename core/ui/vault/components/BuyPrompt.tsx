import { banxaSupportedChains, getBanxaBuyUrl } from '@core/chain/banxa'
import { CoinKey } from '@core/chain/coin/Coin'
import { useCore } from '@core/ui/state/core'
import { ShoppingBagAddIcon } from '@lib/ui/icons/ShoppingBagAddIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoin } from '../state/currentVaultCoins'
import { SecondaryActionWrapper } from './PrimaryActions.styled'

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
        <ShoppingBagAddIcon />
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('buy')}
      </Text>
    </VStack>
  )
}
