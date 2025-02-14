import { TW } from "@trustwallet/wallet-core";
import Long from "long";

import { assertField } from "@lib/utils/record/assertField";
import { cosmosGasLimitRecord } from "@core/chain/chains/cosmos/cosmosGasLimitRecord";
import { getCoinType } from "@core/chain/coin/coinType";
import { PreSignedInputDataResolver } from "./PreSignedInputDataResolver";

export const getThorPreSignedInputData: PreSignedInputDataResolver<
  "thorchainSpecific"
> = ({ keysignPayload, walletCore, chain, chainSpecific }) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  });

  const coin = assertField(keysignPayload, "coin");

  const fromAddr = walletCore.AnyAddress.createWithString(
    coin.address,
    coinType,
  );

  const pubKeyData = Buffer.from(coin.hexPublicKey, "hex");

  let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({});
  let message: TW.Cosmos.Proto.Message[];

  if (chainSpecific.isDeposit) {
    thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
      asset: TW.Cosmos.Proto.THORChainAsset.create({
        chain: "THOR",
        symbol: "RUNE",
        ticker: "RUNE",
        synth: false,
      }),
      decimals: new Long(8),
    });
    const toAmount = Number(keysignPayload.toAmount || "0");
    if (toAmount > 0) {
      thorchainCoin.amount = keysignPayload.toAmount;
    }

    message = [
      TW.Cosmos.Proto.Message.create({
        thorchainDepositMessage:
          TW.Cosmos.Proto.Message.THORChainDeposit.create({
            signer: fromAddr.data(),
            memo: keysignPayload.memo || "",
            coins: [thorchainCoin],
          }),
      }),
    ];
  } else {
    const toAddress = walletCore.AnyAddress.createWithString(
      keysignPayload.toAddress,
      coinType,
    );
    if (!toAddress) {
      throw new Error("invalid to address");
    }
    message = [
      TW.Cosmos.Proto.Message.create({
        thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
          fromAddress: fromAddr.data(),
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              denom: "rune",
              amount: keysignPayload.toAmount,
            }),
          ],
          toAddress: toAddress.data(),
        }),
      }),
    ];
  }

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: new Uint8Array(pubKeyData),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: walletCore.CoinTypeExt.chainId(coinType),
    accountNumber: new Long(Number(chainSpecific.accountNumber)),
    sequence: new Long(Number(chainSpecific.sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: keysignPayload.memo || "",
    messages: message,
    fee: TW.Cosmos.Proto.Fee.create({
      gas: new Long(cosmosGasLimitRecord[chain]),
    }),
  });

  return TW.Cosmos.Proto.SigningInput.encode(input).finish();
};
