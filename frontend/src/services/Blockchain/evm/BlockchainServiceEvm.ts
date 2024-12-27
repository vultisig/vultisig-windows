import { TW } from '@trustwallet/wallet-core';
import { keccak256 } from 'js-sha3';

import { tss } from '../../../../wailsjs/go/models';
import { getSigningInputEnvelopedTxFields } from '../../../chain/evm/tx/getSigningInputEnvelopedTxFields';
import { toEthereumSpecific } from '../../../chain/evm/tx/toEthereumSpecific';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { bigIntToHex } from '../../../chain/utils/bigIntToHex';
import { generateSignatureWithRecoveryId } from '../../../chain/utils/generateSignatureWithRecoveryId';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../../model/transaction';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceEvm
  extends BlockchainService
  implements IBlockchainService
{
  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const transactionInfoSpecific: SpecificEvm =
      obj.specificTransactionInfo as SpecificEvm;

    const payload: KeysignPayload = super.createKeysignPayload(
      obj,
      localPartyId,
      publicKeyEcdsa
    );

    payload.blockchainSpecific = {
      case: 'ethereumSpecific',
      value: toEthereumSpecific(transactionInfoSpecific),
    };

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const blockchainSpecific = keysignPayload.blockchainSpecific as
      | { case: 'ethereumSpecific'; value: EthereumSpecific }
      | undefined;

    if (!blockchainSpecific || blockchainSpecific.case !== 'ethereumSpecific') {
      throw new Error('Invalid blockchain specific');
    }

    const evmSpecific = blockchainSpecific.value;

    if (!keysignPayload.coin) {
      throw new Error('Invalid coin');
    }

    const { gasLimit, maxFeePerGasWei, nonce, priorityFee } = evmSpecific;

    // Amount: converted to hexadecimal, stripped of '0x'
    const amountHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
      'hex'
    );

    // Send native tokens
    let toAddress = keysignPayload.toAddress;
    let evmTransaction = TW.Ethereum.Proto.Transaction.create({
      transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
        amount: amountHex,
        data: Buffer.from(keysignPayload.memo ?? '', 'utf8'),
      }),
    });

    // Send ERC20 tokens, it will replace the transaction object
    if (!keysignPayload.coin.isNativeToken) {
      toAddress = keysignPayload.coin.contractAddress;
      evmTransaction = TW.Ethereum.Proto.Transaction.create({
        erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
          amount: amountHex,
          to: keysignPayload.toAddress,
        }),
      });
    }

    // Create the signing input with the constants
    const input = TW.Ethereum.Proto.SigningInput.create({
      toAddress: toAddress,
      transaction: evmTransaction,
      ...getSigningInputEnvelopedTxFields({
        chain: this.chain,
        walletCore: this.walletCore,
        maxFeePerGasWei: maxFeePerGasWei,
        priorityFee: priorityFee,
        nonce: nonce,
        gasLimit: gasLimit,
      }),
    });

    return TW.Ethereum.Proto.SigningInput.encode(input).finish();
  }

  public async getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const publicKey = await toWalletCorePublicKey({
      walletCore: this.walletCore,
      chain: this.chain,
      value: vaultPublicKey,
    });

    const [dataHash] = getPreSigningHashes({
      walletCore: this.walletCore,
      chain: this.chain,
      txInputData,
    });

    const signature = generateSignatureWithRecoveryId({
      walletCore: this.walletCore,
      signature:
        signatures[hexEncode({ value: dataHash, walletCore: this.walletCore })],
    });

    assertSignature({
      publicKey,
      signature,
      message: dataHash,
    });

    const allSignatures = this.walletCore.DataVector.createWithData(signature);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      txInputData,
      allSignatures,
      this.walletCore.DataVector.create()
    );

    const { errorMessage, encoded } =
      TW.Ethereum.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(errorMessage);

    const result = new SignedTransactionResult(
      this.walletCore.HexCoding.encode(encoded),
      '0x' + keccak256(encoded)
    );
    return result;
  }
}
