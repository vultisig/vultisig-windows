import { create } from '@bufbuild/protobuf';
import { toChainAmount } from '@core/chain/amount/toChainAmount';
import { Chain, EvmChain } from '@core/chain/Chain';
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo';
import { getEvmClient } from '@core/chain/chains/evm/client';
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin';
import {
  EthereumSpecific,
  EthereumSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { publicActionsL2 } from 'viem/zksync';

import { EvmFeeSettings } from '../../evm/fee/EvmFeeSettings';
import { getEvmMaxPriorityFee } from '../../evm/fee/getEvmMaxPriorityFee';
import { getEvmBaseFee } from '../../evm/utils/getEvmBaseFee';
import { getEvmGasLimit } from '../../evm/utils/getEvmGasLimit';
import { defaultFeePriority } from '../../fee/FeePriority';
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

  const nonce = BigInt(
    await getEvmClient(chain).getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  );

  if (chain === Chain.Zksync) {
    const client = getEvmClient(chain).extend(publicActionsL2());
    const value = toChainAmount(shouldBePresent(amount), coin.decimals);

    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } =
      await client.estimateFee({
        chain: evmChainInfo[chain],
        account: coin.address as `0x${string}`,
        to: shouldBePresent(receiver) as `0x${string}`,
        value,
      });

    return create(EthereumSpecificSchema, {
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
      isNativeToken: isFeeCoin(coin),
    });

  const baseFee = await getEvmBaseFee(chain);

  const priorityFeeMapValue = await getEvmMaxPriorityFee(chain);

  const feePriority = feeSettings?.priority ?? defaultFeePriority;
  const priorityFee = priorityFeeMapValue[feePriority];

  let maxFeePerGasWei = Number(
    BigInt(Math.round(Number(baseFee) * baseFeeMultiplier + priorityFee))
  );

  if (maxFeePerGasWei < 1) maxFeePerGasWei = 1;

  return create(EthereumSpecificSchema, {
    maxFeePerGasWei: maxFeePerGasWei.toString(),
    priorityFee: priorityFee.toString(),
    nonce,
    gasLimit: gasLimit.toString(),
  });
};
