import { Endpoint } from '../../Endpoint';
import { RpcServiceCosmos } from '../cosmos/RpcServiceCosmos';

export class RpcServiceKujira extends RpcServiceCosmos {
  protected denom(): string {
    return 'ukuji';
  }

  protected balanceURL(address: string): string {
    return Endpoint.fetchKujiraAccountBalance(address);
  }

  protected transactionURL(): string {
    return Endpoint.broadcastKujiraTransaction;
  }
}
