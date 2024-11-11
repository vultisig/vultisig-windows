/* eslint-disable */
import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceTerraV2 extends RpcServiceCosmos {
  protected denom(): string {
    return 'uluna';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchTerraV2AccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchTerraV2AccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastTerraV2Transaction;
  }
}

export class RpcServiceTerraClassic extends RpcServiceCosmos {
  protected denom(): string {
    return 'uluna';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchTerraClassicAccountBalance(address);
  }

  protected accountNumberURL(address: string): string {
    return Endpoint.fetchTerraClassicAccountNumber(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastTerraClassicTransaction;
  }
}
