import { ethers } from 'ethers';

import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Chain, EvmChain } from '../../../model/chain';
import { RpcServiceEvm } from '../../../services/Rpc/evm/RpcServiceEvm';
import { evmRpcUrl } from '../../evm/evmRpcUrl';
import { EvmFeeSettings } from '../../evm/fee/EvmFeeSettings';
import { getEvmBaseFee } from '../../evm/utils/getEvmBaseFee';
import { getEvmGasLimit } from '../../evm/utils/getEvmGasLimit';
import { defaultFeePriority } from '../../fee/FeePriority';
import { GetChainSpecificInput } from './GetChainSpecificInput';

const baseFeeMultiplier = 1.5;

export const getEthereumSpecific = async ({
  coin,
  feeSettings,
}: Pick<
  GetChainSpecificInput<EvmFeeSettings>,
  'coin' | 'feeSettings'
>): Promise<EthereumSpecific> => {
  const chain = coin.chain as EvmChain;

  const provider = new ethers.JsonRpcProvider(evmRpcUrl[chain]);

  const nonce = BigInt(await provider.getTransactionCount(coin.address));

  if (chain === Chain.Zksync) {
    const result = await provider.send('zks_estimateFee', [
      {
        from: coin.address,
        to: '0000000000000000000000000000000000000000',
        data: 'ffffffff',
      },
    ]);

    return new EthereumSpecific({
      maxFeePerGasWei: result.max_fee_per_gas.toString(),
      priorityFee: result.max_priority_fee_per_gas.toString(),
      gasLimit: result.gas_limit.toString(),
      nonce,
    });
  }

  const gasLimit =
    feeSettings?.gasLimit ??
    getEvmGasLimit({
      chain,
      isNativeToken: coin.isNativeToken,
    });

  const baseFee = await getEvmBaseFee(chain);

  const rpcService = new RpcServiceEvm(chain);

  const priorityFeeMapValue = await rpcService.fetchMaxPriorityFeesPerGas();

  const feePriority = feeSettings?.priority ?? defaultFeePriority;
  const priorityFee = priorityFeeMapValue[feePriority];

  const maxFeePerGasWei = Number(
    BigInt(Math.round(Number(baseFee) * baseFeeMultiplier + priorityFee))
  );

  return new EthereumSpecific({
    maxFeePerGasWei: maxFeePerGasWei.toString(),
    priorityFee: priorityFee.toString(),
    nonce: BigInt(nonce),
    gasLimit: gasLimit.toString(),
  });
};
