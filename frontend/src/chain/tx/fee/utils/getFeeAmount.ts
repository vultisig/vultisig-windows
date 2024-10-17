import { Chain } from '../../../../model/chain';
import {
  BasicSpecificTransactionInfo,
  SpecificEvm,
  SpecificPolkadot,
  SpecificSolana,
  SpecificSui,
  SpecificUtxo,
} from '../../../../model/specific-transaction-info';

type GetFeeAmount<T> = (txInfo: T) => number;

const getEvmFeeAmount: GetFeeAmount<SpecificEvm> = ({ maxFeePerGasWei }) =>
  maxFeePerGasWei;

const getUtxoFeeAmount: GetFeeAmount<SpecificUtxo> = ({ byteFee }) => byteFee;

const getCosmosFeeAmount: GetFeeAmount<BasicSpecificTransactionInfo> = ({
  fee,
}) => fee;

export const getFeeAmount: Record<Chain, GetFeeAmount<any>> = {
  [Chain.Arbitrum]: getEvmFeeAmount,
  [Chain.Avalanche]: getEvmFeeAmount,
  [Chain.Base]: getEvmFeeAmount,
  [Chain.CronosChain]: getEvmFeeAmount,
  [Chain.BSC]: getEvmFeeAmount,
  [Chain.Blast]: getEvmFeeAmount,
  [Chain.Ethereum]: getEvmFeeAmount,
  [Chain.Optimism]: getEvmFeeAmount,
  [Chain.Polygon]: getEvmFeeAmount,
  [Chain.Zksync]: getEvmFeeAmount,
  [Chain.Bitcoin]: getUtxoFeeAmount,
  [Chain.BitcoinCash]: getUtxoFeeAmount,
  [Chain.Litecoin]: getUtxoFeeAmount,
  [Chain.Dogecoin]: getUtxoFeeAmount,
  [Chain.Dash]: getUtxoFeeAmount,
  [Chain.THORChain]: getCosmosFeeAmount,
  [Chain.Cosmos]: getCosmosFeeAmount,
  [Chain.MayaChain]: getCosmosFeeAmount,
  [Chain.Dydx]: getCosmosFeeAmount,
  [Chain.Kujira]: getCosmosFeeAmount,
  [Chain.Sui]: ({ referenceGasPrice }: SpecificSui) => referenceGasPrice,
  [Chain.Solana]: ({ fee }: SpecificSolana) => fee,
  [Chain.Polkadot]: ({ fee }: SpecificPolkadot) => fee,
};
