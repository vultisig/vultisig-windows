export type GasInfo = {
  gasPrice: bigint;
  priorityFee: bigint;
  nonce: number;
  fee: number;
};

export function getDefaultGasInfo(): GasInfo {
  return {
    gasPrice: BigInt(0),
    priorityFee: BigInt(0),
    nonce: 0,
    fee: 0,
  };
}
