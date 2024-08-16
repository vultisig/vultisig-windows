import { IAddressService } from './Address/IAddressService';
import { ICoinService } from './Coin/ICoinService';
import { IRpcService } from './Rpc/IRpcService';
import { ISendService } from './Send/ISendService';

export interface IService {
  rpcService: IRpcService;
  addressService: IAddressService;
  coinService: ICoinService;
  keygenService: any;
  sendService: ISendService;
}
