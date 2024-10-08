/* eslint-disable */
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceGaia extends RpcServiceCosmos {
  protected denom(): string {
    return 'uatom';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchCosmosAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchCosmosAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastCosmosTransaction;
  }
}
