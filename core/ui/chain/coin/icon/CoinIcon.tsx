import { CoinKey, CoinMetadata } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { UiProps } from '@lib/ui/props'

import { getChainLogoSrc } from '../../metadata/getChainLogoSrc'
import { getCoinLogoSrc } from './utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from './utils/shouldDisplayChainLogo'
import { WithChainIcon } from './WithChainIcon'

type CoinIconProps = UiProps & {
  coin: CoinKey & Pick<CoinMetadata, 'logo'>
}

export const CoinIcon = ({ coin, ...rest }: CoinIconProps) => {
  const coinSrc = coin.logo ? getCoinLogoSrc(coin.logo) : undefined

  if (shouldDisplayChainLogo(coin)) {
    return (
      <WithChainIcon {...rest} src={getChainLogoSrc(coin.chain)}>
        <ChainEntityIcon value={coinSrc} />
      </WithChainIcon>
    )
  }

  return <ChainEntityIcon {...rest} value={coinSrc} />
}
