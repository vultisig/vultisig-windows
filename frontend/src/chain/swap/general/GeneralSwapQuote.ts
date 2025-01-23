import { GeneralSwapProvider } from './GeneralSwapProvider';

export type GeneralSwapQuote = {
  dstAmount: string;
  provider: GeneralSwapProvider;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
};
