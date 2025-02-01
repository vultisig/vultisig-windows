import { ChainKind, getChainKind } from '../../../model/chain';
import { executeCosmosTx } from './executeCosmosTx';
import { executeEvmTx } from './executeEvmTx';
import { executePolkadotTx } from './executePolkadotTx';
import { executeRippleTx } from './executeRippleTx';
import { executeSolanaTx } from './executeSolanaTx';
import { executeSuiTx } from './executeSuiTx';
import { executeTonTx } from './executeTonTx';
import { ExecuteTxInput } from './ExecuteTxInput';
import { executeUtxoTx } from './executeUtxoTx';

const handlers: Record<
  ChainKind,
  (input: ExecuteTxInput<any>) => Promise<string>
> = {
  cosmos: executeCosmosTx,
  evm: executeEvmTx,
  polkadot: executePolkadotTx,
  ripple: executeRippleTx,
  solana: executeSolanaTx,
  sui: executeSuiTx,
  ton: executeTonTx,
  utxo: executeUtxoTx,
};

export const executeTx = (input: ExecuteTxInput) => {
  const chainKind = getChainKind(input.chain);

  const handler = handlers[chainKind];

  return handler(input);
};
