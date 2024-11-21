import { IAddressService } from './Address/IAddressService';
import { IBalanceService } from './Balance/IBalanceService';
import { ICoinService } from './Coin/ICoinService';
import { IService } from './IService';
import { IPriceService } from './Price/IPriceService';
import { IRpcService } from './Rpc/IRpcService';

export class Service implements IService {
  rpcService: IRpcService;
  addressService: IAddressService;
  coinService: ICoinService;
  keygenService: any;
  balanceService: IBalanceService;
  priceService: IPriceService;

  constructor(
    rpcService: IRpcService,
    addressService: IAddressService,
    coinService: ICoinService,
    keygenService: any,
    balanceService: IBalanceService,
    priceService: IPriceService
  ) {
    this.rpcService = rpcService;
    this.addressService = addressService;
    this.coinService = coinService;
    this.keygenService = keygenService;
    this.balanceService = balanceService;
    this.priceService = priceService;
  }
}
