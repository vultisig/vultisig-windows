import { useTranslation } from 'react-i18next';

import { storage } from '../../../../wailsjs/go/models';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { OnFinishProp, OptionsProp, ValueProp } from '../../../lib/ui/props';
import { areEqualCoins, CoinKey } from '../../Coin';
import { getStorageCoinKey } from '../../utils/storageCoin';
import { CoinOption } from './CoinOption';

export const SelectCoinOverlay = ({
  onFinish,
  value,
  options,
}: OnFinishProp<CoinKey, 'optional'> &
  OptionsProp<storage.Coin> &
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
          const coinKey = getStorageCoinKey(coin);
          const isActive = !!value && areEqualCoins(coinKey, value);

          return (
            <CoinOption
              key={coin.id}
              value={coin}
              isActive={isActive}
              onClick={() => {
                onFinish(coinKey);
              }}
            />
          );
        })}
      </VStack>
    </Modal>
  );
};
