import { useTranslation } from 'react-i18next';

import { areEqualCoins } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { ClosableComponentProps } from '../../../lib/ui/props';
import { useAssertCurrentVaultCoins } from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';
import { SendCoinOption } from './SendCoinOption';

export const SendCoinExplorer: React.FC<ClosableComponentProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const coins = useAssertCurrentVaultCoins();

  const [value, setValue] = useCurrentSendCoin();

  return (
    <Modal
      width={480}
      placement="top"
      title={t('choose_tokens')}
      onClose={onClose}
    >
      <VStack gap={20}>
        {coins.map(coin => {
          const coinKey = getStorageCoinKey(coin);
          const isActive = areEqualCoins(coinKey, value);

          return (
            <SendCoinOption
              key={coin.id}
              value={coin}
              isActive={isActive}
              onClick={() => {
                setValue(getStorageCoinKey(coin));
                onClose();
              }}
            />
          );
        })}
      </VStack>
    </Modal>
  );
};
