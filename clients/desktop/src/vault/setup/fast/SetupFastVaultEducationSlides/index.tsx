import { useTranslation } from 'react-i18next';
import { useInterval } from 'react-use';
import styled from 'styled-components';

import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { InfoBlock } from '../../../../lib/ui/status/InfoBlock';
import { Text } from '../../../../lib/ui/text';
import { PageContent } from '../../../../ui/page/PageContent';
import { DynamicEducationContent } from './components/DynamicEducationalContent';
import { SlidesLoader } from './components/SlidesLoader';

const Placeholder = styled.div`
  width: 1px;
  height: 1px;
  opacity: 0;
`;

const SLIDE_DURATION_IN_MS = 3000;
export const steps = [
  'multiFactor',
  'selfCustodial',
  'crossChain',
  'over30Chains',
  'availablePlatforms',
  'seedlessWallet',
] as const;

export type SetupFastVaultEducationSlidesStep = (typeof steps)[number];

const Wrapper = styled(VStack)`
  max-width: 550px;
  align-self: center;
`;

export const SetupFastVaultEducationSlides = () => {
  const { t } = useTranslation();
  const { step, toNextStep } = useStepNavigation({ steps, circular: true });

  useInterval(() => toNextStep(), SLIDE_DURATION_IN_MS);

  return (
    <PageContent>
      <Wrapper
        flexGrow
        alignItems="center"
        justifyContent="space-between"
        gap={48}
      >
        {step === 'multiFactor' ? (
          <InfoBlock>
            <Text size={13} color="supporting">
              {t('fastVaultSetup.createVault.multiFactor.subtitle')}
            </Text>
          </InfoBlock>
        ) : (
          <Placeholder />
        )}
        <DynamicEducationContent value={step} />
        <SlidesLoader />
      </Wrapper>
    </PageContent>
  );
};
