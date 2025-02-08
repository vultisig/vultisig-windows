import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../../../wailsjs/go/models';
import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { appPaths } from '../../../../navigation';
import { BackupConfirmation } from './BackupConfirmation';
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne';
import { BackupSuccessSlide } from './BackupSuccessSlides';
import { VaultSharesProvider } from './state/VaultSharesProvider';

const steps = [
  'backupSlideshowPartOne',
  'backupConfirmation',
  'backupSuccessfulSlideshow',
] as const;

type BackupFastVaultProps = {
  vault: storage.Vault;
};

export const BackupSecureVault: FC<BackupFastVaultProps> = ({ vault }) => {
  const navigate = useNavigate();
  const { step, toNextStep } = useStepNavigation({
    steps,
  });

  return (
    <VaultSharesProvider initialValue={vault.keyshares}>
      <Match
        value={step}
        backupSlideshowPartOne={() => (
          <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
        )}
        backupConfirmation={() => (
          <BackupConfirmation onCompleted={toNextStep} vault={vault} />
        )}
        backupSuccessfulSlideshow={() => (
          <BackupSuccessSlide onCompleted={() => navigate(appPaths.vault)} />
        )}
      />
    </VaultSharesProvider>
  );
};
