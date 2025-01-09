import { TW } from '@trustwallet/wallet-core';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import Long from 'long';

import { cosmosFeeCoinDenom } from '../../../chain/cosmos/cosmosFeeCoinDenom';
import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { TransactionType } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { assertField } from '../../../lib/utils/record/assertField';
import { CosmosChain } from '../../../model/chain';
import { BlockchainServiceCosmos } from './BlockchainServiceCosmos';

export class BlockchainServiceTerra extends BlockchainServiceCosmos {
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (
      keysignPayload?.coin?.isNativeToken ||
      keysignPayload?.coin?.contractAddress.toLowerCase().includes('ibc/') ||
      keysignPayload?.coin?.contractAddress.toLowerCase().includes('factory/')
    ) {
      return super.getPreSignedInputData(keysignPayload);
    } else {
      if (
        !keysignPayload?.coin?.contractAddress.includes('terra1') &&
        !keysignPayload?.coin?.contractAddress.includes('ibc/')
      ) {
        return this.getPreSignedInputDataUusd(keysignPayload);
      } else {
        return this.getPreSignedInputDataWasm(keysignPayload);
      }
    }
  }

  async getPreSignedInputDataWasm(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;

    const cosmosSpecific = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'cosmosSpecific'
    );

    const coin = assertField(keysignPayload, 'coin');

    const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex');
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

    const denom = cosmosFeeCoinDenom[this.chain as CosmosChain];

    const message: TW.Cosmos.Proto.Message[] = [
      TW.Cosmos.Proto.Message.create({
        wasmExecuteContractGeneric:
          TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
            senderAddress: coin.address,
            contractAddress: coin.contractAddress,
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

  async getPreSignedInputDataUusd(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;

    const cosmosSpecific = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'cosmosSpecific'
    );

    const coin = assertField(keysignPayload, 'coin');

    const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex');
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

    const denom = cosmosFeeCoinDenom[this.chain as CosmosChain];

    const message: TW.Cosmos.Proto.Message[] = [
      TW.Cosmos.Proto.Message.create({
        sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
          fromAddress: coin.address,
          toAddress: keysignPayload.toAddress,
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              amount: keysignPayload.toAmount,
              denom: coin.contractAddress,
            }),
          ],
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
          TW.Cosmos.Proto.Amount.create({
            amount: '1000000',
            denom: 'uusd',
          }),
        ],
      }),
    });

    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }
}
