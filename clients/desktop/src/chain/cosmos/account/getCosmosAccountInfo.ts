import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';

import { CosmosChain } from '../../../model/chain';
import { ChainAccount } from '../../ChainAccount';
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
