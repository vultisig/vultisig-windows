import { FC } from 'react';

import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { BackupConfirmation } from './BackupConfirmation';
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne';
import { BackupOverviewSlidesPartTwo } from './BackupOverviewSlidesPartTwo';
import { BackupSuccessSlides } from './BackupSuccessSlides';
import { EmailConfirmationSlides } from './EmailConfirmationSlides';

const steps = [
  'backupSlideshowPartOne',
  'enterEmailCode',
  'backupSlideshowPartTwo',
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
      backupSlideshowPartOne={() => (
        <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
      )}
      enterEmailCode={() => (
        <EmailConfirmationSlides onCompleted={toNextStep} vaultId={vaultId} />
      )}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onCompleted={toNextStep} />
      )}
      backupConfirmation={() => <BackupConfirmation />}
      backupGuide={() => <BackupSuccessSlides />}
    />
  );
};
