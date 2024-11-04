/* eslint-disable */
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceOsmosis extends RpcServiceCosmos {
  protected denom(): string {
    return 'uosmo';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchOsmosisAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchOsmosisAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastOsmosisTransaction;
  }
}
