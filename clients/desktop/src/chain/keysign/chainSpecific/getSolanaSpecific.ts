import { create } from '@bufbuild/protobuf';
import { getSolanaClient } from '@core/chain/chains/solana/client';
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin';
import { SolanaSpecificSchema } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { asyncAttempt } from '@lib/utils/promise/asyncAttempt';

import { getSolanaTokenAssociatedAccount } from '../../solana/client/getSolanaTokenAssociatedAccount';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';
import { PublicKey } from '@solana/web3.js';

export const getSolanaSpecific = async ({
  coin,
  receiver,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const client = getSolanaClient();

  const recentBlockHash = (
    await client.getLatestBlockhash()
  ).blockhash.toString();

  const prioritizationFees = await client.getRecentPrioritizationFees({
    lockedWritableAccounts: [new PublicKey(coin.address)],
  });

  const highPriorityFee = Math.max(
    ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
    0
  );

  const result = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: highPriorityFee.toString(),
  });

  if (!isFeeCoin(coin)) {
    result.fromTokenAssociatedAddress = (
      await getSolanaTokenAssociatedAccount({
        account: coin.address,
        token: coin.id,
      })
    ).toString();
    result.toTokenAssociatedAddress = (
      await asyncAttempt(
        () =>
          getSolanaTokenAssociatedAccount({
            account: shouldBePresent(receiver),
            token: coin.id,
          }),
        undefined
      )
    )?.toString();
  }

  return result;
};
