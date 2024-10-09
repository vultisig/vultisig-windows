/* eslint-disable */
import { TW } from '@trustwallet/wallet-core';
import { tss } from '../../../../wailsjs/go/models';
import {
  PolkadotSpecific,
  THORChainSpecific,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import TxCompiler = TW.TxCompiler;
import SignatureProvider from '../signature-provider';
import { createHash } from 'crypto';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import { BlockchainService } from '../BlockchainService';
import {
  SpecificPolkadot,
  SpecificThorchain,
} from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { RpcServiceThorchain } from '../../Rpc/thorchain/RpcServiceThorchain';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

export class BlockchainServicePolkadot
  extends BlockchainService
  implements IBlockchainService
{
  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload: KeysignPayload = super.createKeysignPayload(
      obj,
      localPartyId,
      publicKeyEcdsa
    );
    const specific = new PolkadotSpecific();
    const gasInfoSpecific: SpecificPolkadot =
      obj.specificTransactionInfo as SpecificPolkadot;

    specific.currentBlockNumber = gasInfoSpecific.currentBlockNumber.toString();
    specific.genesisHash = gasInfoSpecific.genesisHash;
    specific.nonce = BigInt(gasInfoSpecific.nonce);
    specific.recentBlockHash = gasInfoSpecific.recentBlockHash;
    specific.specVersion = gasInfoSpecific.specVersion;
    specific.transactionVersion = gasInfoSpecific.transactionVersion;

    payload.blockchainSpecific = {
      case: 'polkadotSpecific',
      value: specific,
    };

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    try {
      if (keysignPayload.coin?.chain !== Chain.Polkadot) {
        throw new Error('Coin is not Polkadot');
      }

      const {
        recentBlockHash,
        nonce,
        currentBlockNumber,
        specVersion,
        transactionVersion,
        genesisHash,
      } = keysignPayload.blockchainSpecific
        .value as unknown as PolkadotSpecific;

      const t = TW.Polkadot.Proto.Balance.Transfer.create({
        memo: keysignPayload.memo,
        toAddress: keysignPayload.toAddress,
        value: new Uint8Array(Buffer.from(keysignPayload.toAmount)),
      });

      const balance = TW.Polkadot.Proto.Balance.create({
        transfer: t,
      });

      const input = TW.Polkadot.Proto.SigningInput.create({
        genesisHash: new Uint8Array(Buffer.from(genesisHash, 'hex')),
        blockHash: new Uint8Array(Buffer.from(recentBlockHash, 'hex')),
        nonce,
        specVersion,
        transactionVersion,
        network: this.coinType.value,
        era: TW.Polkadot.Proto.Era.create({
          blockNumber: BigInt(currentBlockNumber),
          period: 64,
        }),
        balanceCall: balance,
      });

      return TW.Polkadot.Proto.SigningInput.encode(input).finish();
    } catch (error) {
      throw error;
    }
  }

  async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    const walletCore = this.walletCore;
    const coinType = walletCore.CoinType.polkadot;
    const inputData = await this.getPreSignedInputData(keysignPayload);
    const hashes = walletCore.TransactionCompiler.preImageHashes(
      coinType,
      inputData
    );
    const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
    if (preSigningOutput.errorMessage !== '') {
      console.error('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }
    return [
      walletCore.HexCoding.encode(preSigningOutput.dataHash).stripHexPrefix(),
    ];
  }
}
