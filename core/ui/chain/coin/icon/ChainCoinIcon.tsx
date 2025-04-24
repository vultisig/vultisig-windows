import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { UiProps } from '@lib/ui/props'

import { WithChainIcon } from './WithChainIcon'

type ChainCoinIconProps = UiProps & {
  chainSrc?: string
  coinSrc?: string
}

export const ChainCoinIcon = ({
  chainSrc,
  coinSrc,
  ...rest
}: ChainCoinIconProps) => {
  if (chainSrc) {
    return (
      <WithChainIcon {...rest} src={chainSrc}>
        <ChainEntityIcon value={coinSrc} />
      </WithChainIcon>
    )
  }

  return <ChainEntityIcon {...rest} value={coinSrc} />
}
