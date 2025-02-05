import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { BackupOverviewSlides } from './BackupOverviewSlidesPart1';

const steps = [
  'vaultOverview',
  'enterEmailCode',
  'backupConfirmation',
  'backupGuide',
] as const;

export const BackupFastVault = () => {
  const { step, toNextStep } = useStepNavigation({
    steps,
  });

  return (
    <Match
      value={step}
      vaultOverview={() => <BackupOverviewSlides onCompleted={toNextStep} />}
      enterEmailCode={() => <></>}
      backupConfirmation={() => <></>}
      backupGuide={() => <></>}
    />
  );
};
