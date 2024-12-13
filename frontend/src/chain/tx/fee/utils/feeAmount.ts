import { Chain, EvmChain } from '../../../../model/chain';
import {
  BasicSpecificTransactionInfo,
  SpecificEvm,
  SpecificSui,
  SpecificUtxo,
} from '../../../../model/specific-transaction-info';
import { gwei } from './evm';
import { getChainFeeCoin } from './getChainFeeCoin';

type GetFeeAmount<T> = (txInfo: T) => number;

const getEvmFeeAmount: GetFeeAmount<SpecificEvm> = ({ maxFeePerGasWei }) =>
  maxFeePerGasWei;

const getUtxoFeeAmount: GetFeeAmount<SpecificUtxo> = ({ byteFee }) => byteFee;

const getDefaultFeeAmount: GetFeeAmount<BasicSpecificTransactionInfo> = ({
  fee,
}) => fee;

export const getFeeAmountRecord: Record<Chain, GetFeeAmount<any>> = {
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
  [Chain.THORChain]: getDefaultFeeAmount,
  [Chain.Cosmos]: getDefaultFeeAmount,
  [Chain.MayaChain]: getDefaultFeeAmount,
  [Chain.Dydx]: getDefaultFeeAmount,
  [Chain.Kujira]: getDefaultFeeAmount,
  [Chain.Sui]: ({ referenceGasPrice }: SpecificSui) => referenceGasPrice,
  [Chain.Solana]: getDefaultFeeAmount,
  [Chain.Polkadot]: getDefaultFeeAmount,
  [Chain.Ton]: getDefaultFeeAmount,
  [Chain.Osmosis]: getDefaultFeeAmount,
  [Chain.Terra]: getDefaultFeeAmount,
  [Chain.TerraClassic]: getDefaultFeeAmount,
  [Chain.Noble]: getDefaultFeeAmount,
  [Chain.Ripple]: getDefaultFeeAmount,
};

export const getFeeAmountDecimals = (chain: Chain): number =>
  chain in EvmChain ? gwei.decimals : getChainFeeCoin(chain).decimals;
