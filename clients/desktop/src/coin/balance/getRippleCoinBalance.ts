import { callRpc } from '../../chain/rpc/callRpc';
import { Endpoint } from '../../services/Endpoint';
import { CoinBalanceResolver } from './CoinBalanceResolver';

interface RippleAccountData {
  Account: string;
  Balance: string;
  Flags: number;
  LedgerEntryType: string;
  OwnerCount: number;
  PreviousTxnID: string;
  PreviousTxnLgrSeq: number;
  Sequence: number;
  index: string;
}

interface RippleAccountInfoResponse {
  account_data: RippleAccountData;
  ledger_current_index: number;
  queue_data?: {
    txn_count: number;
  };
  validated: boolean;
}

export const getRippleCoinBalance: CoinBalanceResolver = async input => {
  const { account_data } = await callRpc<RippleAccountInfoResponse>({
    url: Endpoint.rippleServiceRpc,
    method: 'account_info',
    params: [
      {
        account: input.address,
        ledger_index: 'current',
        queue: true,
      },
    ],
  });

  return BigInt(account_data.Balance);
};
