import { useDefaultChains } from '../../../lib/hooks/useDefaultChains';

const VaultDefaultChains = () => {
  const { defaultChains } = useDefaultChains();

  console.log('## default chains', defaultChains);

  return <div>VaultDefaultChains</div>;
};

export default VaultDefaultChains;
