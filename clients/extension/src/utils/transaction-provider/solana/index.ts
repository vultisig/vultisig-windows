import { Buffer } from "buffer";
import { create } from "@bufbuild/protobuf";
import { TW, WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import Long from "long";
import {
  SolanaSpecificSchema,
  SolanaSpecific,
} from "protos/blockchain_specific_pb";
import {
  KeysignPayloadSchema,
  KeysignPayload,
} from "protos/keysign_message_pb";
import { CoinSchema } from "protos/coin_pb";

import { ChainKey, rpcUrl } from "utils/constants";
import type {
  ITransaction,
  SignatureProps,
  SignedTransaction,
  SpecificSolana,
  VaultProps,
} from "utils/interfaces";
import api from "utils/api";
import BaseTransactionProvider from "utils/transaction-provider/base";

import { SignedTransactionResult } from "utils/signed-transaction-result";
export default class SolanaTransactionProvider extends BaseTransactionProvider {
  constructor(
    chainKey: ChainKey,
    chainRef: { [chainKey: string]: CoinType },
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore);
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;
  }

  async fetchTokenAssociatedAccountByOwner(
    walletAddress: string,
    mintAddress: string
  ): Promise<string> {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { mint: mintAddress },
        { encoding: "jsonParsed" },
      ],
    };

    const response = await api.rpc.post(rpcUrl.Solana, requestBody);
    const accounts = response.result?.value || [];
    return accounts.length > 0 ? accounts[0].pubkey : "";
  }

  async fetchRecentBlockhash(): Promise<string> {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getLatestBlockhash",
      params: [{ commitment: "confirmed" }],
    };
    const response = await api.rpc.post(rpcUrl.Solana, requestBody);
    return response.result?.value?.blockhash as string;
  }

  public async getSpecificTransactionInfo(): Promise<SpecificSolana> {
    try {
      const [recentBlockHash] = await Promise.all([
        this.fetchRecentBlockhash(),
      ]);

      if (!recentBlockHash) {
        throw new Error("Failed to get recent block hash");
      }

      return {
        recentBlockHash,
        priorityFee: 1_000,
        gasPrice: 1_000_000 / Math.pow(10, 9),
        fee: 1_000_000,
      } as SpecificSolana;
    } catch (error) {
      throw new Error(`Error fetching gas info: ${(error as any).message}`);
    }
  }

  public getKeysignPayload = (
    transaction: ITransaction.METAMASK,
    vault: VaultProps
  ): Promise<KeysignPayload> => {
    return new Promise((resolve) => {
      const coin = create(CoinSchema, {
        chain: transaction.chain.name,
        ticker: transaction.chain.ticker,
        address: transaction.from,
        decimals: transaction.chain.decimals,
        hexPublicKey: vault.chains.find(
          (chain) => chain.name === transaction.chain.name
        )?.derivationKey,
        isNativeToken: true,
        logo: transaction.chain.ticker.toLowerCase(),
        priceProviderId: "solana",
      });
      this.getSpecificTransactionInfo().then((specificData) => {
        const solanaSpecific = create(SolanaSpecificSchema, {
          $typeName: "vultisig.keysign.v1.SolanaSpecific",
          recentBlockHash: specificData.recentBlockHash,
          priorityFee: specificData.priorityFee.toString(),
        });

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.to,
          toAmount: transaction.value
            ? BigInt(parseInt(transaction.value)).toString()
            : "0",
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: "VultiConnect",
          coin,
          blockchainSpecific: {
            case: "solanaSpecific",
            value: solanaSpecific,
          },
        });

        this.keysignPayload = keysignPayload;
        resolve(keysignPayload);
      });
    });
  };

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const solanaSpecific = this.keysignPayload?.blockchainSpecific
        .value as unknown as SolanaSpecific;
      const {
        recentBlockHash,
        fromTokenAssociatedAddress,
        toTokenAssociatedAddress,
      } = solanaSpecific;
      const priorityFeePrice = 1_000;
      const priorityFeeLimit = Number(100_000);
      const newRecentBlockHash = recentBlockHash;
      if (!this.keysignPayload || !this.keysignPayload.coin) {
        throw new Error("keysignPayload is missing");
      }

      if (this.keysignPayload.coin.isNativeToken) {
        // Native token transfer
        const input = TW.Solana.Proto.SigningInput.create({
          transferTransaction: TW.Solana.Proto.Transfer.create({
            recipient: this.keysignPayload.toAddress,
            value: Long.fromString(this.keysignPayload.toAmount),
          }),
          recentBlockhash: newRecentBlockHash,
          sender: this.keysignPayload.coin.address,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(priorityFeePrice.toString()),
          }),
        });

        // Encode the input
        const encodedInput =
          TW.Solana.Proto.SigningInput.encode(input).finish();

        return resolve(encodedInput);
      } else {
        // Token transfer
        if (fromTokenAssociatedAddress && toTokenAssociatedAddress) {
          // Both addresses are available for token transfer
          const tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
            tokenMintAddress: this.keysignPayload.coin.contractAddress,
            senderTokenAddress: fromTokenAssociatedAddress,
            recipientTokenAddress: toTokenAssociatedAddress,
            amount: Long.fromString(this.keysignPayload.toAmount),
            decimals: this.keysignPayload.coin.decimals,
          });
          const input = TW.Solana.Proto.SigningInput.create({
            tokenTransferTransaction: tokenTransferMessage,
            recentBlockhash: newRecentBlockHash,
            sender: this.keysignPayload.coin.address,
            priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
              price: Long.fromString(priorityFeePrice.toString()),
            }),
            priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
              limit: priorityFeeLimit,
            }),
          });
          resolve(TW.Solana.Proto.SigningInput.encode(input).finish());
        } else if (fromTokenAssociatedAddress && !toTokenAssociatedAddress) {
          // Generate the associated address if `toTokenAssociatedAddress` is missing
          const receiverAddress =
            this.walletCore.SolanaAddress.createWithString(
              this.keysignPayload.toAddress
            );
          const generatedAssociatedAddress =
            receiverAddress.defaultTokenAddress(
              this.keysignPayload.coin.contractAddress
            );
          if (!generatedAssociatedAddress) {
            throw new Error(
              "We must have the association between the minted token and the TO address"
            );
          }
          const createAndTransferTokenMessage =
            TW.Solana.Proto.CreateAndTransferToken.create({
              recipientMainAddress: this.keysignPayload.toAddress,
              tokenMintAddress: this.keysignPayload.coin.contractAddress,
              recipientTokenAddress: generatedAssociatedAddress,
              senderTokenAddress: fromTokenAssociatedAddress,
              amount: Long.fromString(this.keysignPayload.toAmount),
              decimals: this.keysignPayload.coin.decimals,
            });
          const input = TW.Solana.Proto.SigningInput.create({
            createAndTransferTokenTransaction: createAndTransferTokenMessage,
            recentBlockhash: newRecentBlockHash,
            sender: this.keysignPayload.coin.address,
            priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
              price: Long.fromString(priorityFeePrice.toString()),
            }),
            priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
              limit: priorityFeeLimit,
            }),
          });
          resolve(TW.Solana.Proto.SigningInput.encode(input).finish());
        } else {
          throw new Error(
            "To send tokens we must have the association between the minted token and the TO address"
          );
        }
      }
    });
  };

  public getSignedTransaction = ({
    inputData,
    signature,
    vault,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }> => {
    return new Promise((resolve, reject) => {
      if (inputData && vault) {
        try {
          const coinType = this.walletCore.CoinType.solana;
          const pubkeySolana = vault.chains.find(
            (chain) => chain.name === ChainKey.SOLANA
          )?.derivationKey;
          const allSignatures = this.walletCore.DataVector.create();
          const publicKeys = this.walletCore.DataVector.create();
          const pubkey = this.walletCore.PublicKey.createWithData(
            Buffer.from(pubkeySolana!, "hex"),
            this.walletCore.PublicKeyType.ed25519
          );
          const modifiedSig = this.getSignature(signature);
          if (!pubkey.verify(modifiedSig, inputData)) {
            console.error("error verifying signature");
          }
          allSignatures.add(modifiedSig);
          publicKeys.add(pubkey.data());
          const compileWithSignatures =
            this.walletCore.TransactionCompiler.compileWithSignatures(
              coinType,
              inputData,
              allSignatures,
              publicKeys
            );
          const {
            encoded,
            signatures,
            errorMessage: solanaErrorMessage,
          } = TW.Solana.Proto.SigningOutput.decode(compileWithSignatures);
          if (solanaErrorMessage) {
            reject(solanaErrorMessage);
          } else {
            const result = new SignedTransactionResult(
              encoded,
              signatures[0].signature!,
              undefined
            );
            resolve({ txHash: result.transactionHash, raw: encoded });
          }
        } catch (err) {
          console.error("Error generating signed transaction:", err);
          reject(err);
        }
      } else {
        reject(new Error("Public key for Solana not found"));
      }
    });
  };

  private getSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R).reverse();
    const sData = this.walletCore.HexCoding.decode(signature.S).reverse();
    const combinedData = new Uint8Array(rData.length + sData.length);
    combinedData.set(rData);
    combinedData.set(sData, rData.length);
    return combinedData;
  }
}
