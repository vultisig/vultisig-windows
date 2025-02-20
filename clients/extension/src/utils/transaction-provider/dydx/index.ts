import CosmosTransactionProvider from '@clients/extension/src/utils/transaction-provider/cosmos'
export default class DydxTransactionProvider extends CosmosTransactionProvider {
  protected accountNumberURL(address: string): string | null {
    return `https://dydx-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`
  }

  protected denom(): string {
    return 'adydx'
  }
}
