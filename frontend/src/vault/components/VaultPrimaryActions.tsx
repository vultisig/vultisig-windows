import { Button } from '../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { Text } from '../../lib/ui/text';
import { SendCoinPromptDeprecated } from './sendDeprecated/SendCoinPromptDeprecated';

export const VaultPrimaryActions: React.FC = () => {
  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendCoinPromptDeprecated />
      <Button kind="outlined">
        <Text color="primarAlt">SWAP</Text>
      </Button>
    </UniformColumnGrid>
  );
};
