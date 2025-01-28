import { FC } from 'react';

import { Match } from '../../../../lib/ui/base/Match';
import { ONBOARDING_ANIMATIONS } from '../hooks/useOnboardingStepsAnimations';
import { VaultBackup } from './VaultBackup';
import { VaultDevice } from './VaultDevice';
import { VaultRecovery } from './VaultRecovery';
import { VaultSharesInfo } from './VaultSharesInfo';
import { VaultSharesIntro } from './VaultSharesIntro';
import { VaultUnlock } from './VaultUnlock';

type AnimationDescriptionProps = {
  animation: (typeof ONBOARDING_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => (
  <Match
    value={animation}
    vaultSharesIntro={() => <VaultSharesIntro />}
    vaultSharesInfo={() => <VaultSharesInfo />}
    vaultDevice={() => <VaultDevice />}
    vaultRecovery={() => <VaultRecovery />}
    vaultBackup={() => <VaultBackup />}
    vaultUnlock={() => <VaultUnlock />}
  />
);
