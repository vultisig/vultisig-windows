import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin';
import { Coin } from '@core/chain/coin/Coin';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { OnFinishProp, OptionsProp, ValueProp } from '../../../lib/ui/props';
import { CoinOption } from './CoinOption';

export const SelectCoinOverlay = ({
  onFinish,
  value,
  options,
}: OnFinishProp<CoinKey, 'optional'> &
  OptionsProp<Coin> &
  Partial<ValueProp<CoinKey>>) => {
  const { t } = useTranslation();

  return (
    <Modal
      width={480}
      placement="top"
      title={t('choose_tokens')}
      onClose={() => onFinish()}
    >
      <VStack gap={20}>
        {options.map(coin => {
          const isActive = !!value && areEqualCoins(coin, value);

          return (
            <CoinOption
              key={coin.id}
              value={coin}
              isActive={isActive}
              onClick={() => {
                onFinish(coin);
              }}
            />
          );
        })}
      </VStack>
    </Modal>
  );
};
