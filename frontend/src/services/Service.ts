import { IAddressService } from './Address/IAddressService';
import { ICoinService } from './Coin/ICoinService';
import { IService } from './IService';
import { IRpcService } from './Rpc/IRpcService';
import { ISendService } from './Send/ISendService';

export class Service implements IService {
  rpcService: IRpcService;
  addressService: IAddressService;
  coinService: ICoinService;
  keygenService: any;
  sendService: ISendService;

  constructor(
    rpcService: IRpcService,
    addressService: IAddressService,
    coinService: ICoinService,
    keygenService: any,
    sendService: ISendService
  ) {
    this.rpcService = rpcService;
    this.addressService = addressService;
    this.coinService = coinService;
    this.keygenService = keygenService;
    this.sendService = sendService;
  }
}
