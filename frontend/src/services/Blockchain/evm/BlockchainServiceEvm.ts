import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { keccak256 } from 'js-sha3';

import { tss } from '../../../../wailsjs/go/models';
import { getEvmPublicClient } from '../../../chain/evm/chainInfo';
import { getSigningInputEnvelopedTxFields } from '../../../chain/evm/tx/getSigningInputEnvelopedTxFields';
import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { bigIntToHex } from '../../../chain/utils/bigIntToHex';
import { generateSignatureWithRecoveryId } from '../../../chain/utils/generateSignatureWithRecoveryId';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { isInError } from '../../../lib/utils/error/isInError';
import { assertField } from '../../../lib/utils/record/assertField';
import { EvmChain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';

export class BlockchainServiceEvm
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const evmSpecific = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'ethereumSpecific'
    );

    const coin = assertField(keysignPayload, 'coin');

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
    if (!coin.isNativeToken) {
      toAddress = coin.contractAddress;
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

  public async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
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

    const rawTx = this.walletCore.HexCoding.encode(encoded);
    const txHash = '0x' + keccak256(encoded);

    const publicClient = getEvmPublicClient(this.chain as EvmChain);

    try {
      const hash = await publicClient.sendRawTransaction({
        serializedTransaction: rawTx as `0x${string}`,
      });
      return hash;
    } catch (error) {
      const isAlreadyBroadcast = isInError(
        error,
        'already known',
        'transaction is temporarily banned',
        'nonce too low',
        'transaction already exists'
      );

      if (isAlreadyBroadcast) {
        return txHash;
      }

      throw error;
    }
  }
}
