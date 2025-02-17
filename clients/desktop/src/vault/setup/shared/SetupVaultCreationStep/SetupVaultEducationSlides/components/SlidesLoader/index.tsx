import { useTranslation } from 'react-i18next';

import { CheckIcon } from '../../../../../../../lib/ui/icons/CheckIcon';
import { HStack } from '../../../../../../../lib/ui/layout/Stack';
import { Text } from '../../../../../../../lib/ui/text';
import { MatchKeygenSessionStatus } from '../../../../../../keygen/shared/MatchKeygenSessionStatus';
import {
  IconWrapper,
  Loader,
  ProgressBarWrapper,
  StyledProgressLine,
  Wrapper,
} from './SlidesLoader.styled';

export const SlidesLoader = () => {
  const { t } = useTranslation();

  return (
    <Wrapper justifyContent="center">
      <HStack gap={8}>
        <IconWrapper>
          <CheckIcon />
        </IconWrapper>
        <Text color="shy">{t('fastVaultSetup.preparingVault')}</Text>
      </HStack>
      <HStack gap={8}>
        <Loader />
        <Text color="shy">{t('fastVaultSetup.generatingECDSAKey')}</Text>
      </HStack>

      <ProgressBarWrapper>
        <MatchKeygenSessionStatus
          pending={() => <StyledProgressLine value={0.25} />}
          active={value => (
            <StyledProgressLine value={value === 'ecdsa' ? 0.75 : 0.5} />
          )}
        />
      </ProgressBarWrapper>
    </Wrapper>
  );
};
