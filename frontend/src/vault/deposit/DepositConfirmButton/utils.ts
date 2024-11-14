import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import {
  IDepositTransactionVariant,
  TransactionType,
} from '../../../model/transaction';
import { ChainAction } from '../DepositForm/chainOptionsConfig';

type CreateTransactionParams = {
  selectedChainAction: ChainAction;
  sender: string;
  receiver?: string;
  amount?: number;
  memo: string;
  coin: Coin;
  affiliateFee?: number;
  percentage?: number;
  specificTransactionInfo?: SpecificTransactionInfo;
};

export const createTransaction = ({
  selectedChainAction,
  sender,
  receiver = '',
  amount = 0,
  memo,
  coin,
  affiliateFee,
  percentage,
  specificTransactionInfo,
}: CreateTransactionParams): IDepositTransactionVariant => {
  switch (selectedChainAction) {
    case 'bond':
    case 'stake':
      return {
        fromAddress: sender,
        toAddress: shouldBePresent(receiver),
        amount: shouldBePresent(amount),
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    case 'unbond':
      return {
        fromAddress: sender,
        toAddress: shouldBePresent(receiver),
        amount: shouldBePresent(amount),
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    case 'leave':
      return {
        fromAddress: sender,
        toAddress: shouldBePresent(receiver),
        amount: amount || 1e-8, // Default amount if not provided
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    case 'addPool':
      return {
        fromAddress: sender,
        amount: shouldBePresent(amount),
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    case 'withdrawPool':
      return {
        fromAddress: sender,
        percentage: shouldBePresent(percentage),
        affiliateFee,
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    case 'vote':
      return {
        fromAddress: sender,
        amount: 0, // Voting doesn't require an amount
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    case 'unstake':
      return {
        fromAddress: sender,
        toAddress: shouldBePresent(receiver),
        amount: shouldBePresent(amount),
        memo,
        coin,
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo,
      };
    default:
      throw new Error(`Unsupported transaction type: ${selectedChainAction}`);
  }
};
