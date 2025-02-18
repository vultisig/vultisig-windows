import { useTranslation } from 'react-i18next';

import { CheckIcon } from '../../../../../../../lib/ui/icons/CheckIcon';
import { HStack } from '../../../../../../../lib/ui/layout/Stack';
import { Text } from '../../../../../../../lib/ui/text';
import {
  KeygenStatus,
  MatchKeygenSessionStatus,
} from '../../../../../../keygen/shared/MatchKeygenSessionStatus';
import {
  IconWrapper,
  Loader,
  ProgressBarWrapper,
  StyledProgressLine,
  Wrapper,
} from './SlidesLoader.styled';

export const SlidesLoader = () => {
  const { t } = useTranslation();

  const renderContent = (value?: KeygenStatus) => {
    const texts = [
      t('fastVaultSetup.preparingVault'),
      t('fastVaultSetup.generatingECDSAKey'),
      t('fastVaultSetup.generatingEDDSAKey'),
    ];

    const steps = {
      loading: { progress: 0.25, checkedSteps: -1 },
      prepareVault: { progress: 0.5, checkedSteps: 1 },
      ecdsa: { progress: 0.7, checkedSteps: 2 },
      eddsa: { progress: 0.9, checkedSteps: 3 },
    };

    const { progress, checkedSteps = 0 } = steps[value || 'loading'];
    console.log(value);

    return (
      <>
        {texts.map((text, index) => (
          <HStack gap={8} key={index} alignItems="center">
            {index < checkedSteps ? (
              <IconWrapper>
                <CheckIcon />
              </IconWrapper>
            ) : (
              <Loader />
            )}
            <Text color="shy">{text}</Text>
          </HStack>
        ))}
        <ProgressBarWrapper>
          <StyledProgressLine value={progress} />
        </ProgressBarWrapper>
      </>
    );
  };

  return (
    <Wrapper justifyContent="center">
      <MatchKeygenSessionStatus
        pending={() => renderContent()}
        active={value => renderContent(value)}
      />
    </Wrapper>
  );
};
