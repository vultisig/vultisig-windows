import { EvmChain } from '../../../model/chain';
import { evmNativeTokenGasLimit, evmTokenGasLimit } from '../evmGasLimit';

type GetEvmGasLimitInput = {
  chainId: EvmChain;
  isNativeToken: boolean;
};

export const getEvmGasLimit = ({
  chainId,
  isNativeToken,
}: GetEvmGasLimitInput) => {
  const record = isNativeToken ? evmNativeTokenGasLimit : evmTokenGasLimit;
  return record[chainId];
};
