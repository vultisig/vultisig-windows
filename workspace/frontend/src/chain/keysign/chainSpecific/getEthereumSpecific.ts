import { ethers } from 'ethers';
import { publicActionsL2 } from 'viem/zksync';

import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain, EvmChain } from '../../../model/chain';
import { RpcServiceEvm } from '../../../services/Rpc/evm/RpcServiceEvm';
import {
  evmChainInfo,
  getEvmChainRpcUrl,
  getEvmPublicClient,
} from '../../evm/chainInfo';
import { EvmFeeSettings } from '../../evm/fee/EvmFeeSettings';
import { getEvmBaseFee } from '../../evm/utils/getEvmBaseFee';
import { getEvmGasLimit } from '../../evm/utils/getEvmGasLimit';
import { defaultFeePriority } from '../../fee/FeePriority';
import { toChainAmount } from '../../utils/toChainAmount';
import { GetChainSpecificInput } from './GetChainSpecificInput';

const baseFeeMultiplier = 1.5;

export const getEthereumSpecific = async ({
  coin,
  feeSettings,
  amount,
  receiver,
}: Pick<
  GetChainSpecificInput<EvmFeeSettings>,
  'coin' | 'feeSettings' | 'amount' | 'receiver'
>): Promise<EthereumSpecific> => {
  const chain = coin.chain as EvmChain;

  const provider = new ethers.JsonRpcProvider(getEvmChainRpcUrl(chain));

  const nonce = BigInt(await provider.getTransactionCount(coin.address));

  if (chain === Chain.Zksync) {
    const client = getEvmPublicClient(chain).extend(publicActionsL2());

    const value = toChainAmount(shouldBePresent(amount), coin.decimals);

    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } =
      await client.estimateFee({
        chain: evmChainInfo[chain],
        account: coin.address as `0x${string}`,
        to: shouldBePresent(receiver) as `0x${string}`,
        value,
      });

    return new EthereumSpecific({
      maxFeePerGasWei: maxFeePerGas.toString(),
      priorityFee: maxPriorityFeePerGas.toString(),
      gasLimit: gasLimit.toString(),
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
    nonce,
    gasLimit: gasLimit.toString(),
  });
};
