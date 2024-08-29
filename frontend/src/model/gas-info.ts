export type FeeGasInfo = {
  gasPrice: bigint;
  priorityFee: bigint;
  nonce: number;
  fee: number;
};

export function getDefaultGasInfo(): FeeGasInfo {
  return {
    gasPrice: BigInt(0),
    priorityFee: BigInt(0),
    nonce: 0,
    fee: 0,
  };
}
