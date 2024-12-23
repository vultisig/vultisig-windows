import { TW } from '@trustwallet/wallet-core';

import { storage, tss } from '../../../../wailsjs/go/models';
import { PolkadotSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain, ChainUtils } from '../../../model/chain';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import TxCompiler = TW.TxCompiler;
import Long from 'long';

import { Keysign } from '../../../../wailsjs/go/tss/TssService';
import { bigIntToHex } from '../../../chain/utils/bigIntToHex';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { getCoinType } from '../../../chain/walletCore/getCoinType';
import { SpecificPolkadot } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../../model/transaction';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { BlockchainService } from '../BlockchainService';
import SignatureProvider from '../signature-provider';

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
    if (keysignPayload.coin?.chain !== Chain.Polkadot) {
      console.error('Coin is not Polkadot');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
    }

    const polkadotSpecific = keysignPayload.blockchainSpecific
      .value as PolkadotSpecific;
    if (!polkadotSpecific) {
      console.error(
        'getPreSignedInputData fail to get DOT transaction information from RPC'
      );
    }

    const {
      recentBlockHash,
      nonce,
      currentBlockNumber,
      specVersion,
      transactionVersion,
      genesisHash,
    } = polkadotSpecific;

    try {
      // Amount: converted to hexadecimal, stripped of '0x'
      const amountHex = Buffer.from(
        stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
        'hex'
      );

      const t = TW.Polkadot.Proto.Balance.Transfer.create({
        toAddress: keysignPayload.toAddress,
        value: new Uint8Array(amountHex),
        memo: keysignPayload.memo || '',
      });

      const balance = TW.Polkadot.Proto.Balance.create({
        transfer: t,
      });

      const nonceLong =
        nonce == BigInt(0) ? Long.ZERO : Long.fromString(nonce.toString());
      const currentBlockNumberLong = Long.fromString(currentBlockNumber);
      const periodLong = Long.fromString('64');

      const era = TW.Polkadot.Proto.Era.create({
        blockNumber: currentBlockNumberLong,
        period: periodLong,
      });

      const ss58Prefix = this.walletCore.CoinTypeExt.ss58Prefix(this.coinType);
      const input = TW.Polkadot.Proto.SigningInput.create({
        genesisHash: this.hexToBytes(genesisHash),
        blockHash: this.hexToBytes(recentBlockHash),
        nonce: nonceLong,
        specVersion: specVersion,
        transactionVersion: transactionVersion,
        network: ss58Prefix,
        era: era,
        balanceCall: balance,
      });

      return TW.Polkadot.Proto.SigningInput.encode(input).finish();
    } catch (e) {
      console.error('Error in getPreSignedInputData:', e);
      throw e;
    }
  }

  // Helper function to convert hex string to Uint8Array
  hexToBytes(hex: string): Uint8Array {
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;
    return new Uint8Array(Buffer.from(hex, 'hex'));
  }

  public async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    let inputData: Uint8Array;
    if (data instanceof Uint8Array) {
      inputData = data;
    } else {
      inputData = await this.getPreSignedInputData(data);
    }

    const publicKey = await this.addressService.getPublicKey(
      '',
      vaultHexPublicKey,
      vaultHexChainCode
    );
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );

    // console.log('preHashes:', preHashes);

    const preSigningOutput =
      TxCompiler.Proto.PreSigningOutput.decode(preHashes);
    if (preSigningOutput.errorMessage !== '') {
      console.error('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }

    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const signature = signatureProvider.getSignature(preSigningOutput.data);

    if (!publicKey.verify(signature, preSigningOutput.data)) {
      console.error('Failed to verify signature');
      throw new Error('Failed to verify signature');
    }

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      inputData,
      allSignatures,
      publicKeys
    );

    const output = TW.Polkadot.Proto.SigningOutput.decode(compiled);
    if (output.errorMessage !== '') {
      console.error('output error:', output.errorMessage);
      throw new Error(output.errorMessage);
    }

    const result = new SignedTransactionResult(
      this.walletCore.HexCoding.encode(output.encoded),
      this.walletCore.HexCoding.encode(
        this.walletCore.Hash.blake2b(output.encoded, 32)
      )
    );

    //console.log('Signed transaction:', result);

    return result;
  }

  async signAndBroadcastTransaction(
    vault: storage.Vault,
    messages: string[],
    sessionID: string,
    hexEncryptionKey: string,
    serverURL: string,
    keysignPayload: KeysignPayload
  ): Promise<string> {
    try {
      const rpcService = RpcServiceFactory.createRpcService(this.chain);

      const tssType = ChainUtils.getTssKeysignType(this.chain);

      const coinType = getCoinType({
        walletCore: this.walletCore,
        chain: this.chain,
      });

      const keysignGoLang = await Keysign(
        vault,
        messages,
        vault.local_party_id,
        this.walletCore.CoinTypeExt.derivationPath(coinType),
        sessionID,
        hexEncryptionKey,
        serverURL,
        tssType.toString().toLowerCase()
      );

      const signatures: { [key: string]: tss.KeysignResponse } = {};
      messages.forEach((msg, idx) => {
        signatures[msg] = keysignGoLang[idx];
      });

      const signedTx = await this.getSignedTransaction(
        vault.public_key_eddsa,
        vault.hex_chain_code,
        keysignPayload,
        signatures
      );

      if (!signedTx) {
        console.error("Couldn't sign transaction");
        return "Couldn't sign transaction";
      }

      let txBroadcastedHash = await rpcService.broadcastTransaction(
        signedTx.rawTransaction
      );

      if (txBroadcastedHash !== signedTx.transactionHash) {
        if (txBroadcastedHash === 'Transaction already broadcasted.') {
          txBroadcastedHash = signedTx.transactionHash;
        } else {
          return 'Transaction hash mismatch';
        }
      }
      return txBroadcastedHash;
    } catch (e: any) {
      console.error(e);
      return e.message;
    }
  }
}
