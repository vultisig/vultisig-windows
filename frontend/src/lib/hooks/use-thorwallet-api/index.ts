import { ThorwalletApi } from '../../../services/Thorwallet';
import { SwapPairsAsset } from '../../types/assets';
import {
  InboundAddress,
  SwapQuoteParams,
  SwapQuoteResponse,
} from '../../types/swap';
import { queryUrl, thorWalletQueryUrl } from '../../utils/query/queryUrl';

export const useThorwalletApi = () => {
  const getMAYAActualInboundAddresses = async () => {
    const endpoint = ThorwalletApi.getMayaAddresses();
    return await queryUrl<InboundAddress[]>(endpoint);
  };

  const getTHORActualInboundAddresses = async () => {
    const endpoint = ThorwalletApi.getThorchainIboundAddresses();
    return await queryUrl<InboundAddress[]>(endpoint);
  };

  const getSwapQuotes = async (params: SwapQuoteParams) => {
    const endpoint = ThorwalletApi.getSwapQuotes(params);
    return await thorWalletQueryUrl<SwapQuoteResponse>(endpoint);
  };

  const getSwapPairs = async (
    chain: string,
    ticker: string,
    contractAddress: string
  ) => {
    const endpoint = ThorwalletApi.getSwapPairs(chain, ticker, contractAddress);
    return await thorWalletQueryUrl<SwapPairsAsset[]>(endpoint);
  };

  return {
    getMAYAActualInboundAddresses,
    getTHORActualInboundAddresses,
    getSwapQuotes,
    getSwapPairs,
  };
};
