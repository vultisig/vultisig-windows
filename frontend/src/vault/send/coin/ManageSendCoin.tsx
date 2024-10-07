import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { getCoinMetaIconSrc } from '../../../coin/utils/coinMeta';
import { Opener } from '../../../lib/ui/base/Opener';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import {
  textInputBackground,
  textInputFrame,
} from '../../../lib/ui/css/textInput';
import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { IconWrapper } from '../../../lib/ui/icons/IconWrapper';
import { InputContainer } from '../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../lib/ui/inputs/InputLabel';
import { HStack, hStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { useAssertCurrentVaultCoin } from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';

const Container = styled(UnstyledButton)`
  ${textInputFrame};
  ${textInputBackground};

  color: ${getColor('contrast')};

  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`;

export const ManageSendCoin = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const { id, chainId } = coinKey;

  const { t } = useTranslation();

  return (
    <InputContainer>
      <InputLabel>{t('asset')}</InputLabel>
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={8}>
              <ChainCoinIcon
                coinSrc={getCoinMetaIconSrc(coin)}
                chainSrc={
                  isNativeCoin({ id, chainId })
                    ? undefined
                    : getChainEntityIconSrc(chainId)
                }
                style={{ fontSize: 32 }}
              />
              <Text weight="400" family="mono" size={16}>
                {coin.ticker}
              </Text>
            </HStack>
            <IconWrapper style={{ fontSize: 20 }}>
              <ChevronRightIcon />
            </IconWrapper>
          </Container>
        )}
        renderContent={({ onClose }) => (
          <Modal title="TODO" onClose={onClose}>
            coming soon...
          </Modal>
        )}
      />
    </InputContainer>
  );
};
