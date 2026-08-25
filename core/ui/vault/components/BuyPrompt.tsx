import { useCore } from '@core/ui/state/core'
import { SecondaryActionWrapper } from '@core/ui/vault/components/PrimaryActions.styled'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { CirclePlusFilledIcon } from '@lib/ui/icons/CirclePlusFilledIcon'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { StationCirclePlusFilledIcon } from '@lib/ui/icons/StationFigmaIcons'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import {
  banxaSupportedChains,
  getBanxaBuyUrl,
} from '@vultisig/core-chain/banxa'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

type BuyPromptProps = {
  coin: CoinKey
}

export const BuyPrompt = ({ coin }: BuyPromptProps) => {
  const { t } = useTranslation()
  const { client, openUrl } = useCore()
  const { ticker, address } = useCurrentVaultCoin(coin)
  const { iconStyle } = useTheme()
  const isExtension = client === 'extension'

  const { chain } = coin

  if (!isOneOf(chain, banxaSupportedChains)) {
    return null
  }

  const url = getBanxaBuyUrl({ address, ticker, chain })

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
        $isExtension={isExtension}
        data-testid="vault-action-buy"
        onClick={() => openUrl(url)}
      >
        {isExtension ? (
          <PlusIcon />
        ) : iconStyle === 'station' ? (
          <StationCirclePlusFilledIcon />
        ) : (
          <CirclePlusFilledIcon />
        )}
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('buy')}
      </Text>
    </VStack>
  )
}
