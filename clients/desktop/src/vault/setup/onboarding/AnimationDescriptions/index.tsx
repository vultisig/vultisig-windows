import { FC } from 'react';
import styled from 'styled-components';

import { Match } from '../../../../lib/ui/base/Match';
import { ONBOARDING_ANIMATIONS } from '../hooks/useOnboardingStepsAnimations';
import { VaultBackup } from './VaultBackup';
import { VaultDevice } from './VaultDevice';
import { VaultRecovery } from './VaultRecovery';
import { VaultSharesInfo } from './VaultSharesInfo';
import { VaultSharesIntro } from './VaultSharesIntro';
import { VaultUnlock } from './VaultUnlock';

const Wrapper = styled.div`
  height: 144px;
`;

type AnimationDescriptionProps = {
  animation: (typeof ONBOARDING_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => (
  <Wrapper>
    <Match
      value={animation}
      vaultSharesIntro={() => <VaultSharesIntro />}
      vaultSharesInfo={() => <VaultSharesInfo />}
      vaultDevice={() => <VaultDevice />}
      vaultRecovery={() => <VaultRecovery />}
      vaultBackup={() => <VaultBackup />}
      vaultUnlock={() => <VaultUnlock />}
    />
  </Wrapper>
);
