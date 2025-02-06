import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { borderRadius } from '../../../../../lib/ui/css/borderRadius';
import { CheckIcon } from '../../../../../lib/ui/icons/CheckIcon';
import { LoadingIndicatorImage } from '../../../../../lib/ui/images/LoadingIndicatorImage';
import { HStack, VStack } from '../../../../../lib/ui/layout/Stack';
import { Text } from '../../../../../lib/ui/text';
import { getColor } from '../../../../../lib/ui/theme/getters';
import { AnimatedLoader } from '../../../../../ui/pending/AnimatedLoader';

const Wrapper = styled(VStack)`
  overflow-y: hidden;
  position: relative;
  ${borderRadius.m};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 28px 36px;
  background-color: ${getColor('foreground')};
  gap: 24px;
  width: 100%;
`;

const LoaderWrapper = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;

const ProgressBarWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -50px;
`;

export const IconWrapper = styled(VStack)`
  color: ${getColor('primary')};
`;

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
        <LoaderWrapper>
          <AnimatedLoader />
        </LoaderWrapper>
        <Text color="shy">{t('fastVaultSetup.generatingECDSAKey')}</Text>
      </HStack>
      <ProgressBarWrapper>
        <LoadingIndicatorImage />
      </ProgressBarWrapper>
    </Wrapper>
  );
};
