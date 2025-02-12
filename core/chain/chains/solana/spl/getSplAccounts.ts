import { Address } from "@solana/web3.js";
import { getSolanaClient } from "../client";

const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export const getSplAccounts = async (address: string) => {
  const client = getSolanaClient();

  const { value } = await client
    .getTokenAccountsByOwner(
      address as Address,
      {
        programId: SPL_TOKEN_PROGRAM_ID as Address,
      },
      {
        encoding: "jsonParsed",
      },
    )
    .send();

  return value;
};
