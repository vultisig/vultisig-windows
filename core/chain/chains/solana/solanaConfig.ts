export const solanaConfig = {
  priorityFeeLimit: 100_000n, // Turbo fee in lamports, around 5 cents
  priorityFeePrice: 1_000_000n, // Turbo fee in lamports, around 5 cents

  // regardless of its complexity Solana charges a fixed base transaction fee of 5000 lamports per transaction.
  // This base fee is separate from the priority fee.
  baseFee: 5000n, // 0.000005 SOL Base fee in lamports
}
