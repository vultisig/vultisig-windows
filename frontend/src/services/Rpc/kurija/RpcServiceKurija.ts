/* eslint-disable */
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceKujira extends RpcServiceCosmos {
  protected denom(): string {
    return 'ukuji';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchKujiraAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchKujiraAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastKujiraTransaction;
  }
}
