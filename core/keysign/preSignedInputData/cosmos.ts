import { cosmosFeeCoinDenom } from "@core/chain/chains/cosmos/cosmosFeeCoinDenom";
import { cosmosGasLimitRecord } from "@core/chain/chains/cosmos/cosmosGasLimitRecord";
import { TransactionType } from "@core/communication/vultisig/keysign/v1/blockchain_specific_pb";
import { assertField } from "@lib/utils/record/assertField";
import { TW } from "@trustwallet/wallet-core";
import Long from "long";

import { getCoinType } from "@core/chain/coin/coinType";
import { PreSignedInputDataResolver } from "./PreSignedInputDataResolver";

export const getCosmosPreSignedInputData: PreSignedInputDataResolver<
  "cosmosSpecific"
> = ({ keysignPayload, walletCore, chain, chainSpecific }) => {
  const coin = assertField(keysignPayload, "coin");

  const pubKeyData = Buffer.from(coin.hexPublicKey, "hex");

  const denom = cosmosFeeCoinDenom[chain];

  const message: TW.Cosmos.Proto.Message[] = [
    TW.Cosmos.Proto.Message.create({
      sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
        fromAddress: coin.address,
        toAddress: keysignPayload.toAddress,
        amounts: [
          TW.Cosmos.Proto.Amount.create({
            amount: keysignPayload.toAmount,
            denom: coin.isNativeToken ? denom : coin.contractAddress,
          }),
        ],
      }),
    }),
  ];

  const coinType = getCoinType({
    walletCore,
    chain,
  });

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: new Uint8Array(pubKeyData),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: walletCore.CoinTypeExt.chainId(coinType),
    accountNumber: new Long(Number(chainSpecific.accountNumber)),
    sequence: new Long(Number(chainSpecific.sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo:
      chainSpecific.transactionType !== TransactionType.VOTE
        ? keysignPayload.memo || ""
        : "",
    messages: message,
    fee: TW.Cosmos.Proto.Fee.create({
      gas: new Long(Number(cosmosGasLimitRecord[chain])),
      amounts: [
        TW.Cosmos.Proto.Amount.create({
          amount: chainSpecific.gas.toString(),
          denom: denom,
        }),
      ],
    }),
  });

  return TW.Cosmos.Proto.SigningInput.encode(input).finish();
};
