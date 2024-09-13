/* eslint-disable */
import { TW } from '@trustwallet/wallet-core';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { SolanaSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import {
    ISendTransaction,
    ISwapTransaction,
    ITransaction,
    TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import { SpecificSolana } from '../../../model/gas-info';

export class BlockchainServiceSolana
    extends BlockchainService
    implements IBlockchainService {
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
        const specific_pb = new SolanaSpecific();
        const transactionInfoSpecific: SpecificSolana =
            obj.specificGasInfo as SpecificSolana;

        switch (obj.transactionType) {
            case TransactionType.SEND:
                specific_pb.fromTokenAssociatedAddress = transactionInfoSpecific.fromAddressPubKey;
                specific_pb.toTokenAssociatedAddress = transactionInfoSpecific.toAddressPubKey;
                specific_pb.priorityFee = transactionInfoSpecific.priorityFee.toString();
                specific_pb.recentBlockHash = transactionInfoSpecific.recentBlockHash;

                payload.blockchainSpecific = {
                    case: 'solanaSpecific',
                    value: specific_pb,
                };
                break;

            case TransactionType.SWAP:
                payload.blockchainSpecific = {
                    case: 'solanaSpecific',
                    value: specific_pb,
                };
                break;

            default:
                throw new Error(`Unsupported transaction type: ${obj.transactionType}`);
        }

        return payload;
    }


    async getPreSignedInputData(
        keysignPayload: KeysignPayload
    ): Promise<Uint8Array> {
        const blockchainSpecific = keysignPayload.blockchainSpecific as
            | { case: 'solanaSpecific'; value: SolanaSpecific }
            | undefined;

        if (!blockchainSpecific || blockchainSpecific.case !== 'solanaSpecific') {
            throw new Error('Invalid blockchain specific');
        }

        const specific = blockchainSpecific.value;

        if (!keysignPayload.coin) {
            throw new Error('Invalid coin');
        }

        const { priorityFee, recentBlockHash, fromTokenAssociatedAddress, toTokenAssociatedAddress } = specific;

        if (keysignPayload.coin.isNativeToken) {

            let input = TW.Solana.Proto.SigningInput.create({
                transferTransaction: TW.Solana.Proto.Transfer.create({
                    recipient: keysignPayload.toAddress,
                    value: BigInt(keysignPayload.toAmount),
                    memo: keysignPayload.memo,
                }),
                recentBlockhash: recentBlockHash,
                sender: keysignPayload.coin.address,
                priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
                    price: BigInt(priorityFee),
                }),
            });

            return TW.Solana.Proto.SigningInput.encode(input).finish();

        } else {

            if (!fromTokenAssociatedAddress && !toTokenAssociatedAddress) {

                let tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
                    tokenMintAddress: keysignPayload.coin.contractAddress,
                    senderTokenAddress: fromTokenAssociatedAddress,
                    recipientTokenAddress: toTokenAssociatedAddress,
                    amount: BigInt(keysignPayload.toAmount),
                    decimals: keysignPayload.coin.decimals,
                });

                let input = TW.Solana.Proto.SigningInput.create({
                    tokenTransferTransaction: tokenTransferMessage,
                    recentBlockhash: recentBlockHash,
                    sender: keysignPayload.coin.address,
                    priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
                        price: BigInt(priorityFee),
                    }),
                });

                return TW.Solana.Proto.SigningInput.encode(input).finish();

            } else if (fromTokenAssociatedAddress && !toTokenAssociatedAddress) {

                let receiverAddress = this.walletCore.SolanaAddress.createWithString(keysignPayload.toAddress);
                let generatedAssociatedAddress = receiverAddress.defaultTokenAddress(keysignPayload.coin.contractAddress);


                if (!generatedAssociatedAddress) {
                    throw new Error("We must have the association between the minted token and the TO address");
                }

                let createAndTransferTokenMessage = TW.Solana.Proto.CreateAndTransferToken.create({
                    recipientMainAddress: keysignPayload.toAddress,
                    tokenMintAddress: keysignPayload.coin.contractAddress,
                    recipientTokenAddress: generatedAssociatedAddress,
                    senderTokenAddress: fromTokenAssociatedAddress,
                    amount: BigInt(keysignPayload.toAmount),
                    decimals: keysignPayload.coin.decimals,
                });

                let input = TW.Solana.Proto.SigningInput.create({
                    createAndTransferTokenTransaction: createAndTransferTokenMessage,
                    recentBlockhash: recentBlockHash,
                    sender: keysignPayload.coin.address,
                    priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
                        price: BigInt(priorityFee),
                    }),
                });

                return TW.Solana.Proto.SigningInput.encode(input).finish();

            }

        }

        throw new Error('To send tokens we must have the association between the minted token and the TO address');
    }

    public async getPreSignedImageHash(
        keysignPayload: KeysignPayload
    ): Promise<string[]> {
        const input = await this.getPreSignedInputData(keysignPayload);
        const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
            this.coinType as any,
            input
        );

        const preSigningOutput =
            TW.Solana.Proto.PreSigningOutput.decode(preHashes);
        if (preSigningOutput.errorMessage !== '') {
            console.error('preSigningOutput error:', preSigningOutput.errorMessage);
            throw new Error(preSigningOutput.errorMessage);
        }

        const imageHashes = [
            this.walletCore.HexCoding.encode(
                preSigningOutput.data
            ).stripHexPrefix(),
        ];
        return imageHashes;
    }
}