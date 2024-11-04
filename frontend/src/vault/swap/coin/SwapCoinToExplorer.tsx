import { useTranslation } from 'react-i18next';

import { areEqualCoins } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { Coin } from '../../../lib/types/coin';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { Chain } from '../../../model/chain';
import { useCoinTo } from '../state/coin-to';
import { SendCoinOption } from './SendCoinOption';

interface SwapCoinToExplorerProps {
  onClose: () => void;
  coins: Coin[];
}

export const SwapCoinToExplorer: React.FC<SwapCoinToExplorerProps> = ({
  onClose,
  coins,
}) => {
  const { t } = useTranslation();
  const [, setCoin] = useCoinTo();

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
          const isActive = areEqualCoins(coinKey, {
            chainId: coin.chain as Chain,
            id: coin.id,
          });

          return (
            <SendCoinOption
              key={coin.id}
              value={coin}
              isActive={isActive}
              onClick={() => {
                setCoin(coin);
                onClose();
              }}
            />
          );
        })}
      </VStack>
    </Modal>
  );
};
