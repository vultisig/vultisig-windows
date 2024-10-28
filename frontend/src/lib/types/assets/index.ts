export interface ApiAsset {
  chain: string;
  chainId: number | null;
  contractAddress: string;
  decimals: number;
  icon: string;
  id: string;
  name: string;
  provider?: SynthProvider[];
  status: string;
  symbol: string;
  ticker: string;
  synth: boolean;
}

export type SynthProvider = 'THORCHAIN' | 'MAYA';

export interface SwapPairsAsset extends Omit<ApiAsset, 'provider' | 'synth'> {
  provider?: SynthProvider;
  isSynth: boolean;
}
