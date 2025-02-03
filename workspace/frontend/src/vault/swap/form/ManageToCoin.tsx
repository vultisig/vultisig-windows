import { useToCoin } from '../state/toCoin';
import { SwapCoinInput } from './SwapCoinInput';

export const ManageToCoin = () => {
  const [value, setValue] = useToCoin();

  return <SwapCoinInput value={value} onChange={setValue} />;
};
