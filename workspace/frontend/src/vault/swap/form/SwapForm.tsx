import { t } from 'i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import { OnForwardProp } from '../../../lib/ui/props';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { RefreshSwap } from '../components/RefreshSwap';
import { SwapAmount } from './amount/SwapAmount';
import { useIsSwapFormDisabled } from './hooks/useIsSwapFormDisabled';
import { SwapInfo } from './info/SwapInfo';
import { ManageFromCoin } from './ManageFromCoin';
import { ManageToCoin } from './ManageToCoin';

export const SwapForm: React.FC<OnForwardProp> = ({ onForward }) => {
  const isDisabled = useIsSwapFormDisabled();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSwap />}
        title={<PageHeaderTitle>{t('swap')}</PageHeaderTitle>}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <WithProgressIndicator value={0.2}>
          <VStack gap={16}>
            <ManageFromCoin />
            <SwapAmount />
            <ManageToCoin />
            <VStack gap={8}>
              <SwapInfo />
            </VStack>
          </VStack>
        </WithProgressIndicator>
        <Button isDisabled={isDisabled} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
