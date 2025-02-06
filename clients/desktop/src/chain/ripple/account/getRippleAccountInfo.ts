import { getRippleClient } from '../client/getRippleClient';

export const getRippleAccountInfo = async (address: string) => {
  const client = await getRippleClient();

  const { result } = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'current',
    queue: true,
  });

  return result.account_data;
};
