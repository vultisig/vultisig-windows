import { ChainKey } from "../chains";

export interface ChainProps {
  active?: boolean;
  address?: string;
  cmcId: number;
  decimals: number;
  derivationKey?: string;
  id: string;
  name: ChainKey;
  ticker: string;
}
