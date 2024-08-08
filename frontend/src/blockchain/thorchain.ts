import {KeysignPayload} from "../gen/vultisig/keysign/v1/keysign_message_pb";
import {Chain, ChainUtils} from "../model/chain";
import {AnyAddress} from "@trustwallet/wallet-core/dist/src/wallet-core";
import {THORChainSpecific} from "../gen/vultisig/keysign/v1/blockchain_specific_pb";

class THORChainHelper{
    static isTHORChainSpecific(obj: any): boolean{
        return obj instanceof THORChainSpecific
    }
    static async getPreSignedInputData(keysignPayload: KeysignPayload) : Promise<Uint8Array>{
        if(keysignPayload.coin?.chain !== Chain.THORChain.toString()){
            throw new Error("Invalid chain");
        }
        let fromAddr = AnyAddress.createWithString(keysignPayload.coin.address, ChainUtils.getCoinType(Chain.THORChain))
        if(!fromAddr){
            throw new Error(`${keysignPayload.coin.address} is invalid`);
        }
        if(!this.isTHORChainSpecific(keysignPayload.blockchainSpecific)){
            throw new Error("Invalid blockchain specific");
        }
        // const thorchainSpecific = keysignPayload.blockchainSpecific as THORChainSpecific;
        // const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
        // if (!pubKeyData){
        //     throw new Error("invalid hex public key");
        // }


    }
}