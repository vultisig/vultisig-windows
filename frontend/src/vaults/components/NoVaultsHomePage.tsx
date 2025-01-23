import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { AnimatedVisibility } from '../../lib/ui/layout/AnimatedVisibility';
import { VStack } from '../../lib/ui/layout/Stack';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock';
import { PageContent } from '../../ui/page/PageContent';

const STATE_MACHINE_NAME = 'State Machine 1';
const INPUT_NAME = 'Next';

export const NoVaultsHomePage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const { RiveComponent, rive } = useRive({
    src: '/rive-animations/onboarding-screen.riv',
    autoplay: true,
    stateMachines: [STATE_MACHINE_NAME],
  });

  const onClickInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME
  );

  console.log('## rive', rive?.stateMachineInputs(STATE_MACHINE_NAME));
  console.log('## rive contents', rive?.contents);
  console.log('## onClickInput', onClickInput);
  console.log('## onClickInput.value', onClickInput?.type);

  return (
    <>
      <RiveComponent />
      <button
        onClick={() => {
          if (onClickInput) {
            console.log('## type is number?');
            onClickInput?.fire();
          }
        }}
      >
        {t('tap')}
      </button>
    </>
  );

  return (
    <PageContent>
      <VStack flexGrow alignItems="center" justifyContent="center">
        <AnimatedVisibility delay={300}>
          <ProductLogoBlock />
        </AnimatedVisibility>
      </VStack>
      <AnimatedVisibility animationConfig="bottomToTop" delay={500}>
        <VStack gap={20}>
          <Button onClick={() => navigate('setupVault', { params: {} })}>
            {t('create_new_vault')}
          </Button>
          <Button onClick={() => navigate('importVault')} kind="secondary">
            {t('import_vault')}
          </Button>
        </VStack>
      </AnimatedVisibility>
    </PageContent>
  );
};
