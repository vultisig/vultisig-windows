/* eslint-disable */
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceNoble extends RpcServiceCosmos {
  protected denom(): string {
    return 'uusdc';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchNobleAccountBalance(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastNobleTransaction;
  }
}
