import { WalletCore } from '@trustwallet/wallet-core';
import { ZodObject } from 'zod';

import { Chain } from '../../../model/chain';
import { ChainAction } from '../ChainAction';
import { requiredFieldsPerChainAction } from '../DepositForm/chainOptionsConfig';

export const isSchemaFunction = (
  schema: unknown
): schema is (
  chain: Chain,
  walletCore: any,
  totalAmountAvailable: number
) => ZodObject<any> => {
  return typeof schema === 'function';
};

export const getFieldsForChainAction = (
  chain: Chain,
  selectedChainAction: ChainAction | undefined
) =>
  chain && selectedChainAction
    ? requiredFieldsPerChainAction[selectedChainAction]?.fields || []
    : [];

export const getChainActionSchema = (
  chain: Chain,
  selectedChainAction: ChainAction | undefined
) =>
  chain && selectedChainAction
    ? requiredFieldsPerChainAction[selectedChainAction]?.schema
    : undefined;

// @antonio: using any because Zod can't be configured
export const resolveSchema = (
  schema: any,
  chain: Chain,
  walletCore: WalletCore,
  totalAmountAvailable: number
) =>
  schema
    ? isSchemaFunction(schema)
      ? schema(chain, walletCore, totalAmountAvailable)
      : schema
    : undefined;
