import { CosmosChain } from '@core/chain/Chain';
import { ChainAccount } from '@core/chain/ChainAccount';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';

import { getCosmosClient } from '../client/getCosmosClient';

export const getCosmosAccountInfo = async ({
  chain,
  address,
}: ChainAccount<CosmosChain>) => {
  const client = await getCosmosClient(chain);
  const accountInfo = await client.getAccount(address);

  console.log('accountInfo', accountInfo);

  return shouldBePresent(accountInfo, `Account: ${address}`);
};
