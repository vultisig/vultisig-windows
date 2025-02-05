import { FC } from 'react';

import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne';
import { EmailConfirmationSlides } from './EmailConfirmationSlides';

const steps = [
  'vaultOverview',
  'enterEmailCode',
  'backupConfirmation',
  'backupGuide',
] as const;

type BackupFastVaultProps = {
  vaultId: string;
};

export const BackupFastVault: FC<BackupFastVaultProps> = ({ vaultId }) => {
  const { step, toNextStep } = useStepNavigation({
    steps,
  });

  return (
    <Match
      value={step}
      vaultOverview={() => (
        <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
      )}
      enterEmailCode={() => (
        <EmailConfirmationSlides onCompleted={toNextStep} vaultId={vaultId} />
      )}
      backupConfirmation={() => <></>}
      backupGuide={() => <></>}
    />
  );
};
