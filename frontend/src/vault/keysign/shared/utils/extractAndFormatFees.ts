import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { formatAmount } from '../../../../lib/utils/formatAmount';

export const extractAndFormatFees = ({
  blockchainSpecific,
  currency,
  decimals,
  locale = 'en-US',
}: {
  blockchainSpecific: KeysignPayload['blockchainSpecific'];
  currency: string;
  decimals?: number;
  locale?: string;
}) => {
  if (!blockchainSpecific || !decimals) {
    return {
      networkFeesFormatted: null,
      totalFeesFormatted: null,
    };
  }

  let networkFee = null;
  let totalFee = null;

  switch (blockchainSpecific.case) {
    case 'utxoSpecific': {
      const byteFee = fromChainAmount(
        blockchainSpecific.value.byteFee,
        decimals
      );
      networkFee = formatAmount(byteFee, currency, locale);
      break;
    }
    case 'ethereumSpecific': {
      const maxFee = fromChainAmount(
        blockchainSpecific.value.maxFeePerGasWei,
        decimals
      );
      const priorityFee = fromChainAmount(
        blockchainSpecific.value.priorityFee,
        decimals
      );
      networkFee = formatAmount(maxFee, currency, locale);
      totalFee = formatAmount(maxFee + priorityFee, currency, locale);
      break;
    }
    case 'thorchainSpecific': {
      const fee = fromChainAmount(blockchainSpecific.value.fee, decimals);
      networkFee = formatAmount(fee, currency, locale);
      break;
    }
    case 'cosmosSpecific': {
      const gasFee = fromChainAmount(blockchainSpecific.value.gas, decimals);
      networkFee = formatAmount(gasFee, currency, locale);
      break;
    }
    case 'suicheSpecific': {
      const referenceGas = fromChainAmount(
        blockchainSpecific.value.referenceGasPrice,
        decimals
      );
      networkFee = formatAmount(referenceGas, currency, locale);
      break;
    }
    case 'tonSpecific': {
      // TODO: @antonio this has to be derived
      break;
    }
    case 'rippleSpecific': {
      const gasFee = fromChainAmount(blockchainSpecific.value.gas, decimals);
      networkFee = formatAmount(gasFee, currency, locale);
      break;
    }
  }

  return {
    networkFeesFormatted: networkFee,
    totalFeesFormatted: totalFee,
  };
};
