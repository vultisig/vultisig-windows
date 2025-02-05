import { getRippleRpcClient } from '../rpc/getRippleRpcClient';

export const getRippleAccountInfo = async (address: string) => {
  const client = await getRippleRpcClient();

  const { result } = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'current',
    queue: true,
  });

  return result.account_data;
};
