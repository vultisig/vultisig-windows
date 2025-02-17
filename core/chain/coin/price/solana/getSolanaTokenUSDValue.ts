import { addQueryParams } from "@lib/utils/query/addQueryParams";

const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const getSolanaTokenUSDValue = async (contractAddress: string): Promise<number> => {
  try {
    const amountDecimal = 1_000_000; // 1 USDC

    const url = addQueryParams("https://quote-api.jup.ag/v4/quote", {
      inputMint: contractAddress,
      outputMint: SOLANA_USDC_MINT,
      amount: amountDecimal.toString(),
      slippageBps: "50",
    });

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch Solana token price.");
      return 0.0;
    }

    const data = await response.json();
    const rawAmount = data?.swapUsdValue ?? "0";

    return parseFloat(rawAmount);
  } catch (error) {
    console.error("Error in getTokenUSDValue:", error);
    return 0.0;
  }
};
