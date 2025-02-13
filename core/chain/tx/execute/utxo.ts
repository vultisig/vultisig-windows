import { TW } from "@trustwallet/wallet-core";

import { UtxoChain } from "@core/chain/Chain";
import { broadcastUtxoTransaction } from "@core/chain/chains/utxo/client/broadcastUtxoTransaction";
import { ExecuteTxResolver } from "./ExecuteTxResolver";
import { stripHexPrefix } from "@lib/utils/hex/stripHexPrefix";

export const executeUtxoTx: ExecuteTxResolver<UtxoChain> = async ({
  compiledTx,
  walletCore,
  chain,
}) => {
  const output = TW.Bitcoin.Proto.SigningOutput.decode(compiledTx);

  await broadcastUtxoTransaction({
    chain,
    tx: stripHexPrefix(walletCore.HexCoding.encode(output.encoded)),
  });

  return output.transactionId;
};
