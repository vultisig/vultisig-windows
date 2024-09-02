export type FeeGasInfo = {
  gasPrice: number;
  priorityFee: number;
  nonce: number;
  fee: number;

  // specifics for EVM

  // specifics for UTXO

  // specifics
};

export function getDefaultGasInfo(): FeeGasInfo {
  return {
    gasPrice: 0,
    priorityFee: 0,
    nonce: 0,
    fee: 0,
  };
}
