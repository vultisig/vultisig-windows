import { ComponentWithValueProps } from '../../lib/ui/props';
import { ChainEntityIcon } from './ChainEntityIcon';

export const ChainIcon = ({
  value,
}: Partial<ComponentWithValueProps<string>>) => {
  return <ChainEntityIcon value={value?.toLowerCase()} />;
};
