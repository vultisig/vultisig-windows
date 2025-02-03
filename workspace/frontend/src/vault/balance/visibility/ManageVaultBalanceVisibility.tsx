import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { EyeIcon } from '../../../lib/ui/icons/EyeIcon';
import { EyeOffIcon } from '../../../lib/ui/icons/EyeOffIcon';
import { useIsVaultBalanceVisible } from './useIsVaultBalanceVisible';

export const ManageVaultBalanceVisibility = () => {
  const [value, setValue] = useIsVaultBalanceVisible();

  return (
    <IconButton
      size="l"
      icon={value ? <EyeIcon /> : <EyeOffIcon />}
      onClick={() => setValue(!value)}
      title={value ? 'Hide balance' : 'Show balance'}
    />
  );
};
