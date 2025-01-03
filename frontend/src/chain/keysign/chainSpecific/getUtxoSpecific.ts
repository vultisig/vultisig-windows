import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { UtxoChain } from '../../../model/chain';
import { EvmFeeSettings } from '../../evm/fee/EvmFeeSettings';
import { getUtxoStats } from '../../utxo/blockchair/getUtxoStats';
import { adjustByteFee } from '../../utxo/fee/adjustByteFee';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getUtxoSpecific = async ({
  coin,
  feeSettings,
  sendMaxAmount,
}: Pick<
  GetChainSpecificInput<EvmFeeSettings>,
  'coin' | 'feeSettings' | 'sendMaxAmount'
>): Promise<UTXOSpecific> => {
  const chain = coin.chain as UtxoChain;

  const { data } = await getUtxoStats(chain);

  let byteFee = data.suggested_transaction_fee_per_byte_sat;
  if (feeSettings) {
    byteFee = adjustByteFee(byteFee, feeSettings);
  }

  return new UTXOSpecific({
    byteFee: byteFee.toString(),
    sendMaxAmount,
  });
};
