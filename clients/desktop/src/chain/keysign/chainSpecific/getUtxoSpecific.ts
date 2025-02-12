import { create } from '@bufbuild/protobuf';
import { toChainAmount } from '@core/chain/amount/toChainAmount';
import { UtxoChain } from '@core/chain/Chain';
import { getUtxoStats } from '@core/chain/chains/utxo/client/getUtxoStats';
import { getCoinBalance } from '@core/chain/coin/balance';
import {
  UTXOSpecific,
  UTXOSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { EvmFeeSettings } from '../../evm/fee/EvmFeeSettings';
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

    result.sendMaxAmount = toChainAmount(amount, coin.decimals) === balance;
  }

  return result;
};
