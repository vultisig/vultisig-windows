import { CoinKey } from '../../coin/Coin';
import { Button } from '../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { SendPrompt } from '../send/SendPrompt';
import { SendCoinPromptDeprecated } from './sendDeprecated/SendCoinPromptDeprecated';

export const VaultPrimaryActions = ({
  value,
}: Partial<ComponentWithValueProps<CoinKey>>) => {
  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendCoinPromptDeprecated />
      <SendPrompt value={value} />
      <Button kind="outlined">
        <Text color="primaryAlt">SWAP</Text>
      </Button>
    </UniformColumnGrid>
  );
};
