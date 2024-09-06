/* eslint-disable */
import { Chain } from '../../model/chain';

export class RpcService {
  chain: Chain;
  constructor(chain: Chain) {
    this.chain = chain;
  }
}
