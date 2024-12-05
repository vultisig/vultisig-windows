import { TW } from '@trustwallet/wallet-core';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import Long from 'long';

import {
  CosmosSpecific,
  TransactionType,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { BlockchainServiceCosmos } from './BlockchainServiceCosmos';

export class BlockchainServiceTerra extends BlockchainServiceCosmos {
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (keysignPayload?.coin?.contractAddress.includes('terra1')) {
      return this.getPreSignedInputDataWasm(keysignPayload);
    }

    return super.getPreSignedInputData(keysignPayload);
  }

  async getPreSignedInputDataWasm(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;

    const cosmosSpecific = keysignPayload.blockchainSpecific
      .value as unknown as CosmosSpecific;

    if (!keysignPayload.coin) {
      throw new Error('keysignPayload.coin is undefined');
    }

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    const toAddress = walletCore.AnyAddress.createWithString(
      keysignPayload.toAddress,
      this.coinType
    );

    if (!toAddress) {
      throw new Error('invalid to address');
    }

    const rpcService = RpcServiceFactory.createRpcService(this.chain) as any;
    const denom = rpcService.denom();

    if (!denom) {
      console.error('getPreSignedInputData > denom is not defined');
      throw new Error('getPreSignedInputData > denom is not defined');
    }
    const message: TW.Cosmos.Proto.Message[] = [
      TW.Cosmos.Proto.Message.create({
        wasmExecuteContractGeneric:
          TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
            senderAddress: keysignPayload.coin.address,
            contractAddress: keysignPayload.coin.contractAddress,
            executeMsg: `{"transfer": { "amount": "${keysignPayload.toAmount}", "recipient": "${keysignPayload.toAddress}" } }`,
          }),
      }),
    ];

    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: new Uint8Array(pubKeyData),
      signingMode: SigningMode.Protobuf,
      chainId: walletCore.CoinTypeExt.chainId(this.coinType),
      accountNumber: new Long(Number(cosmosSpecific.accountNumber)),
      sequence: new Long(Number(cosmosSpecific.sequence)),
      mode: BroadcastMode.SYNC,
      memo:
        cosmosSpecific.transactionType !== TransactionType.VOTE
          ? keysignPayload.memo || ''
          : '',
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: new Long(300000),
        amounts: [
          TW.Cosmos.Proto.Amount.create({
            amount: cosmosSpecific.gas.toString(),
            denom: denom,
          }),
        ],
      }),
    });

    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }
}
