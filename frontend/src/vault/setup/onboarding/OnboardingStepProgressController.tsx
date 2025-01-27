import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { PageContent } from '../../../ui/page/PageContent';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { VaultSharesInfo } from './VaultSharesInfo';
import { VaultSharesIntro } from './VaultSharesIntro';

const steps = [
  'vaultSharesIntro',
  'vaultSharesInfo',
  'vaultDevice',
  'vaultRecovery',
  'vaultBackup',
  'vaultUnlock',
] as const;

export const OnboardingStepProgressController = () => {
  const { step } = useStepNavigation({ steps });
  const currentIndex = steps.indexOf(step);
  const progressRaw = (currentIndex + 1) / steps.length;

  return (
    <PageContent>
      <WithProgressIndicator value={progressRaw}>
        <Match
          value={step}
          vaultSharesIntro={() => <VaultSharesIntro />}
          vaultSharesInfo={() => <VaultSharesInfo />}
          vaultDevice={() => <div>vaultDevice</div>}
          vaultRecovery={() => <div>vaultRecovery</div>}
          vaultBackup={() => <div>vaultBackup</div>}
          vaultUnlock={() => <div>vaultUnlock</div>}
        />
      </WithProgressIndicator>
    </PageContent>
  );
};
