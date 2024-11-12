import { ZodObject } from 'zod';

import { Chain } from '../../../model/chain';
import {
  ChainAction,
  requiredFieldsPerChainAction,
} from '../DepositForm/chainOptionsConfig';

export const isSchemaFunction = (
  schema: unknown
): schema is (chainId: Chain, walletCore: any) => ZodObject<any> => {
  return typeof schema === 'function';
};

export const getRequiredFields = (
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

export const resolveSchema = (schema: any, chainId: Chain, walletCore: any) =>
  schema
    ? isSchemaFunction(schema)
      ? schema(chainId, walletCore)
      : schema
    : undefined;
