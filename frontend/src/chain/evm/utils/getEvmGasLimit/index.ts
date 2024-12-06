import { EvmChain } from '../../../../model/chain';
import { evmNativeTokenGasLimit, evmTokenGasLimit } from '../../evmGasLimit';

type GetEvmGasLimitInput = {
  chain: EvmChain;
  isNativeToken: boolean;
};

export const getEvmGasLimit = ({
  chain,
  isNativeToken,
}: GetEvmGasLimitInput) => {
  const record = isNativeToken ? evmNativeTokenGasLimit : evmTokenGasLimit;
  return record[chain];
};
