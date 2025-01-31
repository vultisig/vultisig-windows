import { UiProps } from '../../lib/ui/props';
import { ChainEntityIcon } from './ChainEntityIcon';
import { WithChainIcon } from './WithChainIcon';

type ChainCoinIconProps = UiProps & {
  chainSrc?: string;
  coinSrc?: string;
};

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
    );
  }

  return <ChainEntityIcon {...rest} value={coinSrc} />;
};
