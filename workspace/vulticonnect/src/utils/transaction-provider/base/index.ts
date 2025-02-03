import { randomBytes } from "ethers";
import { TW, WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import { toBinary } from "@bufbuild/protobuf";

import { ChainKey } from "utils/constants";
import {
  ITransaction,
  SignatureProps,
  SignedTransaction,
  VaultProps,
} from "utils/interfaces";

import {
  KeysignMessage,
  KeysignMessageSchema,
  KeysignPayload,
} from "protos/keysign_message_pb";
import { CustomMessagePayload } from "protos/custom_message_payload_pb";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default abstract class BaseTransactionProvider {
  protected chainKey: ChainKey;
  protected chainRef: ChainRef;
  protected dataEncoder: (data: Uint8Array) => Promise<string>;
  protected walletCore: WalletCore;
  protected keysignPayload?: KeysignPayload;

  constructor(
    chainKey: ChainKey,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;
  }

  protected encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32);

    return Array.from(keyBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  protected stripHexPrefix = (hex: string): string => {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
  };

  protected ensureHexPrefix = (hex: string): string => {
    return hex.startsWith("0x") ? hex : "0x" + hex;
  };

  protected ensurePriorityFeeValue = (
    priorityFee: bigint,
    chainKey: ChainKey
  ): bigint => {
    switch (chainKey) {
      case ChainKey.AVALANCHE:
      case ChainKey.ETHEREUM: {
        const oneGwei = 1000000000n;
        return priorityFee < oneGwei ? oneGwei : priorityFee;
      }
      default:
        return priorityFee;
    }
  };

  public getPreSignedImageHash = (
    preSignedInputData: Uint8Array
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
        this.chainRef[this.chainKey],
        preSignedInputData
      );

      const preSigningOutput =
        TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

      if (preSigningOutput.errorMessage !== "")
        reject(preSigningOutput.errorMessage);

      const imageHash = this.walletCore.HexCoding.encode(
        preSigningOutput.dataHash
      )?.replace(/^0x/, "");

      resolve(imageHash);
    });
  };

  public getTransactionKey = (
    publicKeyEcdsa: string,
    transaction: ITransaction.METAMASK,
    hexChainCode: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      let messsage: KeysignMessage = {
        $typeName: "vultisig.keysign.v1.KeysignMessage",
        sessionId: transaction.id,
        serviceName: "VultiConnect",
        encryptionKeyHex: hexChainCode,
        useVultisigRelay: true,
        payloadId: "",
      };
      if (transaction.isCustomMessage) {
        messsage.customMessagePayload = {
          $typeName: "vultisig.keysign.v1.CustomMessagePayload",
          method: "personal_sign",
          message: transaction.customMessage!.message,
        } as CustomMessagePayload;
      } else {
        messsage.keysignPayload = this.keysignPayload;
      }

      const binary = toBinary(KeysignMessageSchema, messsage);

      this.dataEncoder(binary).then((base64EncodedData) => {
        resolve(
          `vultisig://vultisig.com?type=SignTransaction&vault=${publicKeyEcdsa}&jsonData=${base64EncodedData}`
        );
      });
    });
  };

  abstract getPreSignedInputData(): Promise<Uint8Array>;

  public getDerivePath = (chain: string) => {
    const coin = this.chainRef[chain];
    return this.walletCore.CoinTypeExt.derivationPath(coin);
  };

  abstract getSignedTransaction({
    inputData,
    signature,
    transaction,
    vault,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }>;

  abstract getKeysignPayload(
    transaction: ITransaction.METAMASK,
    vault: VaultProps
  ): Promise<KeysignPayload>;

  protected encodeData(data: Uint8Array): Promise<string> {
    return this.dataEncoder(data);
  }
  public getCustomMessageSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R);
    const sData = this.walletCore.HexCoding.decode(signature.S);
    const vByte = parseInt(signature.RecoveryID, 16); // Convert hex string to integer
    const vData = new Uint8Array([vByte]); // Convert integer to Uint8Array

    const combinedData = new Uint8Array(rData.length + sData.length + 1);
    combinedData.set(rData);
    combinedData.set(sData, rData.length);
    combinedData.set(vData, rData.length + sData.length); // Attach `v` at the end
    return combinedData;
  }

  public getEncodedSignature(signature: SignatureProps): string {
    return this.ensureHexPrefix(
      this.walletCore.HexCoding.encode(
        this.getCustomMessageSignature(signature)
      )
    );
  }
}
