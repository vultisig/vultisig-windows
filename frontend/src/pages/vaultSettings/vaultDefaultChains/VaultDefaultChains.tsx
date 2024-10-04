import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { useDefaultChains } from '../../../lib/hooks/useDefaultChains';
import { VStack } from '../../../lib/ui/layout/Stack';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { getNativeTokens } from '../../../utils/getNativeTokens';
import {
  ChainButton,
  ColumnOneBothRowsItem,
  ColumnThreeRowOneItem,
  ColumnTwoRowOneItem,
  ColumnTwoRowTwoItem,
} from './VaultDefaultChains.styles';

const VaultDefaultChains = () => {
  const { t } = useTranslation();
  const { defaultChains: initialDefaultChains, updateDefaultChains } =
    useDefaultChains();

  const [defaultChains, setDefaultChains] = useState(initialDefaultChains);
  const nativeTokens = getNativeTokens();

  const handleChainToggle = (chain: string) => {
    const formattedDefaultChains = defaultChains.map(c => c.trim());
    let newDefaultChains;

    if (formattedDefaultChains.includes(chain)) {
      newDefaultChains = defaultChains.filter(c => c.trim() !== chain.trim());
    } else {
      newDefaultChains = [...defaultChains, chain];
    }

    setDefaultChains(newDefaultChains);
    updateDefaultChains(newDefaultChains);
  };

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_language')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {nativeTokens.map(({ ticker, chain }, index) => {
          const imgSrc = getChainEntityIconSrc(chain as string);

          return (
            <ChainButton
              key={index}
              onClick={() => handleChainToggle(chain.toLowerCase())}
            >
              <ColumnOneBothRowsItem
                src={imgSrc}
                alt={ticker}
                width={24}
                height={24}
              />
              <ColumnTwoRowOneItem size={16} color="contrast" weight="600">
                {ticker}
              </ColumnTwoRowOneItem>
              <ColumnTwoRowTwoItem size={12} color="contrast" weight="500">
                {chain}
              </ColumnTwoRowTwoItem>
              <ColumnThreeRowOneItem
                onChange={() => {}}
                type="checkbox"
                checked={defaultChains.some(
                  coin => coin.trim() === chain.trim().toLowerCase()
                )}
              />
            </ChainButton>
          );
        })}
      </PageSlice>
    </VStack>
  );
};

export default VaultDefaultChains;
