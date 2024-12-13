import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { SpecificEvm } from '../../../model/specific-transaction-info';

export const toEthereumSpecific = ({
  gasLimit,
  maxFeePerGasWei,
  priorityFee,
  nonce,
}: SpecificEvm): EthereumSpecific =>
  new EthereumSpecific({
    gasLimit: gasLimit.toString(),
    maxFeePerGasWei: maxFeePerGasWei.toString(),
    nonce: BigInt(nonce),
    priorityFee: priorityFee.toString(),
  });
