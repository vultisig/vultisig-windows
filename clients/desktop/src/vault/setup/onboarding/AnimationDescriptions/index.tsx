import { FC } from 'react';
import styled from 'styled-components';

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

const ANIMATION_MAP: Record<number, () => JSX.Element> = {
  0: () => <VaultSharesIntro />,
  1: () => <VaultSharesInfo />,
  2: () => <VaultDevice />,
  3: () => <VaultRecovery />,
  4: () => <VaultBackup />,
  5: () => <VaultUnlock />,
};

type AnimationDescriptionProps = {
  animation: (typeof ONBOARDING_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => <Wrapper>{ANIMATION_MAP[animation]()}</Wrapper>;
