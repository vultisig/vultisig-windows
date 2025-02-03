import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { Endpoint } from '../../../services/Endpoint';

interface TonAccountInfoResponse {
  result: {
    account_state: {
      seqno: number;
    };
  };
}

export async function getTonAccountInfo(address: string) {
  const url = `${Endpoint.vultisigApiProxy}/ton/v2/getExtendedAddressInformation?address=${address}`;
  const { result } = (await Fetch(url)) as TonAccountInfoResponse;

  return result;
}
