import { WalletCore } from '@trustwallet/wallet-core';
import { ZodObject } from 'zod';

import { Chain } from '../../../model/chain';
import {
  ChainAction,
  requiredFieldsPerChainAction,
} from '../DepositForm/chainOptionsConfig';

export const isSchemaFunction = (
  schema: unknown
): schema is (
  chainId: Chain,
  walletCore: any,
  totalAmountAvailable: number
) => ZodObject<any> => {
  return typeof schema === 'function';
};

export const getFieldsForChainAction = (
  chainId: Chain,
  selectedChainAction: ChainAction | undefined
) =>
  chainId && selectedChainAction
    ? requiredFieldsPerChainAction[selectedChainAction]?.fields || []
    : [];

export const getChainActionSchema = (
  chainId: Chain,
  selectedChainAction: ChainAction | undefined
) =>
  chainId && selectedChainAction
    ? requiredFieldsPerChainAction[selectedChainAction]?.schema
    : undefined;

// @antonio: using any because Zod can't be configured
export const resolveSchema = (
  schema: any,
  chainId: Chain,
  walletCore: WalletCore,
  totalAmountAvailable: number
) =>
  schema
    ? isSchemaFunction(schema)
      ? schema(chainId, walletCore, totalAmountAvailable)
      : schema
    : undefined;
