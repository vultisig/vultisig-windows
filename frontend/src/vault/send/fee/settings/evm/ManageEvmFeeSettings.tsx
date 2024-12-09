import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EvmFeeSettings } from '../../../../../chain/evm/fee/EvmFeeSettings';
import {
  defaultFeePriority,
  feePriorities,
  FeePriority,
} from '../../../../../chain/fee/FeePriority';
import { useSpecificTxInfoQuery } from '../../../../../coin/query/useSpecificTxInfoQuery';
import { storageCoinToCoin } from '../../../../../coin/utils/storageCoin';
import { Button } from '../../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../../lib/ui/form/utils/getFormProps';
import { AmountTextInput } from '../../../../../lib/ui/inputs/AmountTextInput';
import { InputContainer } from '../../../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../../../lib/ui/inputs/InputLabel';
import { RadioInput } from '../../../../../lib/ui/inputs/RadioInput';
import { VStack } from '../../../../../lib/ui/layout/Stack';
import { Spinner } from '../../../../../lib/ui/loaders/Spinner';
import { Modal } from '../../../../../lib/ui/modal';
import { ClosableComponentProps } from '../../../../../lib/ui/props';
import { QueryDependant } from '../../../../../lib/ui/query/components/QueryDependant';
import { SpecificEvm } from '../../../../../model/specific-transaction-info';
import { useCurrentVaultCoin } from '../../../../state/currentVault';
import { useCurrentSendCoin } from '../../../state/sendCoin';
import { SendFiatFeeValue } from '../../SendFiatFeeValue';
import { SendGasFeeValue } from '../../SendGasFeeValue';
import {
  SpecificSendTxInfoProvider,
  useSendSpecificTxInfo,
} from '../../SendSpecificTxInfoProvider';
import { FeeContainer } from '../FeeContainer';
import { useFeeSettings } from '../state/feeSettings';
import { BaseFee } from './baseFee/BaseFee';

type FeeSettingsFormShape = {
  priority: FeePriority;
  gasLimit: number | null;
};

export const ManageEvmFeeSettings: React.FC<ClosableComponentProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const [persistentValue, setPersistentValue] =
    useFeeSettings<EvmFeeSettings>();

  const { gasLimit: defaultGasLimit } = useSendSpecificTxInfo() as SpecificEvm;

  const [value, setValue] = useState<FeeSettingsFormShape>(
    () =>
      persistentValue ?? {
        priority: defaultFeePriority,
        gasLimit: defaultGasLimit,
      }
  );

  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);

  const guardedValue: EvmFeeSettings = useMemo(
    () => ({
      ...value,
      gasLimit: value.gasLimit ?? 0,
    }),
    [value]
  );

  const txInfoQuery = useSpecificTxInfoQuery({
    coin: storageCoinToCoin(coin),
    feeSettings: guardedValue,
  });

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: () => {
          setPersistentValue(guardedValue);
          onClose();
        },
        onClose,
      })}
      onClose={onClose}
      title={t('advanced')}
      footer={<Button type="submit">{t('save')}</Button>}
    >
      <VStack gap={12}>
        <InputContainer>
          <InputLabel>{t('priority')}</InputLabel>
          <RadioInput
            options={feePriorities}
            value={value.priority}
            onChange={priority => setValue({ ...value, priority })}
            renderOption={t}
          />
        </InputContainer>
        <BaseFee />
        <AmountTextInput
          label={<InputLabel>{t('gas_limit')}</InputLabel>}
          value={value.gasLimit}
          onValueChange={gasLimit => setValue({ ...value, gasLimit })}
        />
        <InputContainer>
          <InputLabel>
            {t('total_fee')} ({t('gwei')})
          </InputLabel>
          <FeeContainer>
            <QueryDependant
              query={txInfoQuery}
              success={value => (
                <SpecificSendTxInfoProvider value={value}>
                  <span>
                    <SendGasFeeValue />
                  </span>
                  <SendFiatFeeValue />
                </SpecificSendTxInfoProvider>
              )}
              error={() => t('failed_to_load')}
              pending={() => <Spinner />}
            />
          </FeeContainer>
        </InputContainer>
      </VStack>
    </Modal>
  );
};
