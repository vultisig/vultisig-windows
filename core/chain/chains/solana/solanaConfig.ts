export const solanaConfig = {
  priorityFeeLimit: Number(100_000), // Turbo fee in lamports, around 5 cents
  priorityFeePrice: 1_000_000, // Turbo fee in lamports, around 5 cents

  // regardless of its complexity Solana charges a fixed base transaction fee of 5000 lamports per transaction.
  // This base fee is separate from the priority fee.
  baseFee: 5000, // 0.000005 SOL Base fee in lamports
}
