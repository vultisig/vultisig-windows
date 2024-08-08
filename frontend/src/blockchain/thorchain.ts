import { KeysignPayload } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../model/chain';
import {
  AnyAddress,
  CoinType,
  CoinTypeExt,
  HexCoding,
  TransactionCompiler,
} from '@trustwallet/wallet-core/dist/src/wallet-core';
import { THORChainSpecific } from '../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { TW } from '@trustwallet/wallet-core';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import TxCompiler = TW.TxCompiler;

class THORChainHelper {
  static coinType = CoinType.thorchain;
  static isTHORChainSpecific(obj: any): boolean {
    return obj instanceof THORChainSpecific;
  }
  static getPreSignedInputData(keysignPayload: KeysignPayload): Uint8Array {
    if (keysignPayload.coin?.chain !== Chain.THORChain.toString()) {
      throw new Error('Invalid chain');
    }
    const fromAddr = AnyAddress.createWithString(
      keysignPayload.coin.address,
      this.coinType
    );
    if (!fromAddr) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }
    if (!this.isTHORChainSpecific(keysignPayload.blockchainSpecific)) {
      throw new Error('Invalid blockchain specific');
    }
    const thorchainSpecific =
      keysignPayload.blockchainSpecific as THORChainSpecific;
    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }
    let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({});
    let message: TW.Cosmos.Proto.Message[];
    if (thorchainSpecific.isDeposit) {
      thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
        asset: TW.Cosmos.Proto.THORChainAsset.create({
          chain: 'THOR',
          symbol: 'RUNE',
          ticker: 'RUNE',
          synth: false,
        }),
        decimals: 8,
      });
      const toAmount = Number(keysignPayload.toAmount || '0');
      if (toAmount > 0) {
        thorchainCoin.amount = keysignPayload.toAmount;
      }

      message = [
        TW.Cosmos.Proto.Message.create({
          thorchainDepositMessage:
            TW.Cosmos.Proto.Message.THORChainDeposit.create({
              signer: fromAddr.data(),
              memo: keysignPayload.memo,
              coins: [thorchainCoin],
            }),
        }),
      ];
    } else {
      const toAddress = AnyAddress.createWithString(
        keysignPayload.toAddress,
        this.coinType
      );
      if (!toAddress) {
        throw new Error('invalid to address');
      }
      message = [
        TW.Cosmos.Proto.Message.create({
          thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
            fromAddress: fromAddr.data(),
            amounts: [
              TW.Cosmos.Proto.Amount.create({
                denom: 'rune',
                amount: keysignPayload.toAmount,
              }),
            ],
            toAddress: toAddress.data(),
          }),
        }),
      ];
    }
    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: pubKeyData,
      signingMode: SigningMode.Protobuf,
      chainId: CoinTypeExt.chainId(this.coinType),
      accountNumber: thorchainSpecific.accountNumber,
      sequence: thorchainSpecific.sequence,
      mode: BroadcastMode.SYNC,
      memo: keysignPayload.memo,
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: 20000000,
      }),
    });
    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }

  static getPreSignedImageHash(keysignPayload: KeysignPayload): [string] {
    const inputData = this.getPreSignedInputData(keysignPayload);
    const hashes = TransactionCompiler.preImageHashes(this.coinType, inputData);
    const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
    if (preSigningOutput.errorMessage !== '') {
      throw new Error(preSigningOutput.errorMessage);
    }
    return [HexCoding.encode(preSigningOutput.dataHash)];
  }
}
export default THORChainHelper;
