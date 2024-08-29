import { Button } from '../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { Text } from '../../lib/ui/text';

export const VaultPrimaryActions = () => {
  return (
    <UniformColumnGrid fullWidth gap={12}>
      <Button kind="outlined">SEND</Button>
      <Button kind="outlined">
        <Text color="primarAlt">SWAP</Text>
      </Button>
    </UniformColumnGrid>
  );
};
