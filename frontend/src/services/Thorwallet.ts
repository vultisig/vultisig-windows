import { SwapPairsAsset } from '../lib/types/assets';
import {
  InboundAddress,
  SwapQuoteParams,
  SwapQuoteResponse,
} from '../lib/types/swap';
import { queryUrl, thorWalletQueryUrl } from '../lib/utils/query/queryUrl';

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

export const getMAYAActualInboundAddresses = async () => {
  const endpoint = ThorwalletApi.getMayaAddresses();
  return await queryUrl<InboundAddress[]>(endpoint);
};

export const getTHORActualInboundAddresses = async () => {
  const endpoint = ThorwalletApi.getThorchainIboundAddresses();
  return await queryUrl<InboundAddress[]>(endpoint);
};

export const getSwapQuotes = async (params: SwapQuoteParams) => {
  const endpoint = ThorwalletApi.getSwapQuotes(params);
  return await thorWalletQueryUrl<SwapQuoteResponse>(endpoint);
};

export const getSwapPairs = async (
  chain: string,
  ticker: string,
  contractAddress: string
) => {
  const endpoint = ThorwalletApi.getSwapPairs(chain, ticker, contractAddress);
  return await thorWalletQueryUrl<SwapPairsAsset[]>(endpoint);
};
