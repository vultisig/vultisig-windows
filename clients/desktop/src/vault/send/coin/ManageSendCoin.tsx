import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { CoinInputContainer } from '../../../coin/ui/inputs/CoinInputContainer';
import { SelectCoinOverlay } from '../../../coin/ui/inputs/SelectCoinOverlay';
import { Opener } from '../../../lib/ui/base/Opener';
import { InputContainer } from '../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../lib/ui/inputs/InputLabel';
import { Text } from '../../../lib/ui/text';
import { formatAmount } from '@lib/utils/formatAmount';
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '../../state/currentVault';
import { useCurrentSendCoin } from '../state/sendCoin';
import { SendCoinBalanceDependant } from './balance/SendCoinBalanceDependant';

export const ManageSendCoin = () => {
  const [value, setValue] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(value);

  const { t } = useTranslation();

  const options = useCurrentVaultCoins();

  return (
    <InputContainer>
      <InputLabel>{t('asset')}</InputLabel>
      <Opener
        renderOpener={({ onOpen }) => (
          <CoinInputContainer
            value={{ ...value, logo: coin.logo, ticker: coin.ticker }}
            onClick={onOpen}
          />
        )}
        renderContent={({ onClose }) => (
          <SelectCoinOverlay
            onFinish={newValue => {
              if (newValue) {
                setValue(newValue);
              }
              onClose();
            }}
            options={options}
          />
        )}
      />
      <Text
        centerVertically
        weight="400"
        size={14}
        family="mono"
        color="supporting"
        style={{ gap: 8 }}
      >
        <span>{t('balance')}:</span>
        <SendCoinBalanceDependant
          success={({ amount, decimals }) => (
            <span>{formatAmount(fromChainAmount(amount, decimals))}</span>
          )}
        />
      </Text>
    </InputContainer>
  );
};
