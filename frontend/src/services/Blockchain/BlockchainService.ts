/* eslint-disable */
import { WalletCore } from '@trustwallet/wallet-core';
import { storage, tss } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain, ChainUtils } from '../../model/chain';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../model/transaction';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';
import { IAddressService } from '../Address/IAddressService';
import { IBlockchainService } from './IBlockchainService';
import { SignedTransactionResult } from './signed-transaction-result';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { Keysign } from '../../../wailsjs/go/tss/TssService';
import { RpcServiceFactory } from '../Rpc/RpcServiceFactory';
import { getCoinType } from '../../chain/walletCore/getCoinType';

export class BlockchainService implements IBlockchainService {
  chain: Chain;
  walletCore: WalletCore;
  coinType: CoinType;
  addressService: IAddressService;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.coinType = getCoinType({ walletCore, chain });
    this.addressService = AddressServiceFactory.createAddressService(
      this.chain,
      walletCore
    );
  }

  async signAndBroadcastTransaction(
    vault: storage.Vault,
    messages: string[],
    sessionID: string,
    hexEncryptionKey: string,
    serverURL: string,
    keysignPayload: KeysignPayload
  ): Promise<string> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);

    const tssType = ChainUtils.getTssKeysignType(this.chain);

    const keysignGoLang = await Keysign(
      vault,
      messages,
      vault.local_party_id,
      this.walletCore.CoinTypeExt.derivationPath(this.coinType),
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
      vault.public_key_ecdsa,
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

    if (
      txBroadcastedHash.toLowerCase() !==
        signedTx.transactionHash.toLowerCase() &&
      txBroadcastedHash === 'Transaction already broadcasted.'
    ) {
      txBroadcastedHash = signedTx.transactionHash;
    }

    return txBroadcastedHash;
  }

  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload = new KeysignPayload({
      ...obj,
      toAmount: BigInt(
        Math.round(obj.amount * 10 ** obj.coin.decimals)
      ).toString(),
      vaultLocalPartyId: localPartyId,
      vaultPublicKeyEcdsa: publicKeyEcdsa,
    });

    return payload;
  }

  getPreSignedInputData(_keysignPayload: KeysignPayload): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  getSignedTransaction(
    _vaultHexPublicKey: string,
    _vaultHexChainCode: string,
    _data: KeysignPayload | Uint8Array,
    _signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    throw new Error('Method not implemented.');
  }
}
