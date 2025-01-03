import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceDydx extends RpcServiceCosmos {
  protected denom(): string {
    return 'adydx';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchDydxAccountBalance(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastDydxTransaction;
  }
}
