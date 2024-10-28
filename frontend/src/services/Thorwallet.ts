import { SwapQuoteParams } from '../lib/types/swap';

export class ThorwalletApi {
  static thorWalletApi: string = 'https://api-v2-dev.thorwallet.org';
  static mayaNodeUrl: string = 'https://mayanode.mayachain.info';
  static thorNodeUrl: string = 'https://thorchain-thornode-lb-1.thorwallet.org';

  static getMayaAddresses(): string {
    return `${this.mayaNodeUrl}/mayachain/inbound_addresses`;
  }

  static getThorchainIboundAddresses(): string {
    return `${this.thorNodeUrl}/thorchain/inbound_addresses`;
  }

  static getSwapQuotes({
    fromAsset,
    toAsset,
    amount,
    destination,
    fromAddress,
    toleranceBps,
    fromAssetDecimal,
    toAssetDecimal,
    ethAddress,
  }: SwapQuoteParams): string {
    return `${this.thorWalletApi}/quote/swap?fromAsset=${fromAsset}&toAsset=${toAsset}&amount=${amount}&destination=${destination}&fromAddress=${fromAddress}&toleranceBps=${toleranceBps}&fromAssetDecimal=${fromAssetDecimal}&toAssetDecimal=${toAssetDecimal}${
      (ethAddress && `&ethAddress=${ethAddress}`) || ''
    }`;
  }

  static getSwapPairs(
    chain: string,
    ticker: string,
    contractAddress: string
  ): string {
    return `${this.thorWalletApi}/quote/pairs?chain=${chain}&ticker=${ticker}${
      contractAddress ? `&contractAddress=${contractAddress}` : ''
    }`;
  }
}
