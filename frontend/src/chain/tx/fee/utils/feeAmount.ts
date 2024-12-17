import {
  EthereumSpecific,
  SuiSpecific,
  THORChainSpecific,
  UTXOSpecific,
} from '../../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Chain, EvmChain } from '../../../../model/chain';
import { gwei } from './evm';
import { getChainFeeCoin } from './getChainFeeCoin';

type GetFeeAmount<T> = (txInfo: T) => number;

const getEvmFeeAmount: GetFeeAmount<EthereumSpecific> = ({
  maxFeePerGasWei,
}): number => Number(maxFeePerGasWei);

const getUtxoFeeAmount: GetFeeAmount<UTXOSpecific> = ({ byteFee }): number =>
  Number(byteFee);

const getDefaultFeeAmount: GetFeeAmount<THORChainSpecific> = ({
  fee,
}): number => Number(fee);

const getSuiFeeAmount: GetFeeAmount<SuiSpecific> = ({
  referenceGasPrice,
}): number => Number(referenceGasPrice);

export const getFeeAmountRecord: Record<Chain, GetFeeAmount<any>> = {
  // EVM Chains
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

  // UTXO Chains
  [Chain.Bitcoin]: getUtxoFeeAmount,
  [Chain.BitcoinCash]: getUtxoFeeAmount,
  [Chain.Litecoin]: getUtxoFeeAmount,
  [Chain.Dogecoin]: getUtxoFeeAmount,
  [Chain.Dash]: getUtxoFeeAmount,

  // Default Chains
  [Chain.THORChain]: getDefaultFeeAmount,
  [Chain.Cosmos]: getDefaultFeeAmount,
  [Chain.MayaChain]: getDefaultFeeAmount,
  [Chain.Dydx]: getDefaultFeeAmount,
  [Chain.Kujira]: getDefaultFeeAmount,
  [Chain.Solana]: getDefaultFeeAmount,
  [Chain.Polkadot]: getDefaultFeeAmount,
  [Chain.Ton]: getDefaultFeeAmount,
  [Chain.Osmosis]: getDefaultFeeAmount,
  [Chain.Terra]: getDefaultFeeAmount,
  [Chain.TerraClassic]: getDefaultFeeAmount,
  [Chain.Noble]: getDefaultFeeAmount,
  [Chain.Ripple]: getDefaultFeeAmount,

  // SUI Chain
  [Chain.Sui]: getSuiFeeAmount,
};

export const getFeeAmountDecimals = (chain: Chain): number =>
  chain in EvmChain ? gwei.decimals : getChainFeeCoin(chain).decimals;
