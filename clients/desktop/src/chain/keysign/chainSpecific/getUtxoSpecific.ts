import { create } from '@bufbuild/protobuf';
import {
  UTXOSpecific,
  UTXOSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { getCoinBalance } from '../../../coin/balance/getCoinBalance';
import { UtxoChain } from '../../../model/chain';
import { EvmFeeSettings } from '../../evm/fee/EvmFeeSettings';
import { toChainAmount } from '../../utils/toChainAmount';
import { getUtxoStats } from '../../utxo/blockchair/getUtxoStats';
import { adjustByteFee } from '../../utxo/fee/adjustByteFee';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getUtxoSpecific = async ({
  coin,
  feeSettings,
  amount,
}: Pick<
  GetChainSpecificInput<EvmFeeSettings>,
  'coin' | 'feeSettings' | 'amount'
>): Promise<UTXOSpecific> => {
  const chain = coin.chain as UtxoChain;

  const { data } = await getUtxoStats(chain);

  let byteFee = data.suggested_transaction_fee_per_byte_sat;
  if (feeSettings) {
    byteFee = adjustByteFee(byteFee, feeSettings);
  }

  const result = create(UTXOSpecificSchema, {
    byteFee: byteFee.toString(),
  });

  if (amount) {
    const balance = await getCoinBalance(coin);

    result.sendMaxAmount =
      toChainAmount(amount, coin.decimals) === balance.amount;
  }

  return result;
};
