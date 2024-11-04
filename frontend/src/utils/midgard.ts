import BigNumber from 'bignumber.js';

import { InboundAddress } from '../lib/types/swap';
import { queryUrl } from '../lib/utils/query/queryUrl';

const MIDGARD_DECIMAL = 8;

const CACAO_DECIMAL = 10;

export const formatMidgardNumber = (
  value: string,
  isMaya?: boolean
): BigNumber =>
  new BigNumber(value).div(10 ** (isMaya ? CACAO_DECIMAL : MIDGARD_DECIMAL));

export const getInboundAddressForChain = async (
  chain: string,
  isMaya: boolean
) => {
  if (isMaya) {
    const endpoint =
      'https://mayanode.mayachain.info/mayachain/inbound_addresses';
    const addresses = await queryUrl<InboundAddress[]>(endpoint);
    return addresses.find(address => address.chain === chain);
  }
  const endpoint =
    'https://6hhrq5i9yk.execute-api.eu-central-1.amazonaws.com/dev/cors/midgardInboundAddresses';
  const addresses = await queryUrl<{ data: { data: InboundAddress[] } }>(
    endpoint
  );
  return addresses.data.data.find(address => address.chain === chain);
};
