import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useTranslation } from 'react-i18next';

import { OnBackProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { BackupFastVault } from './backup/BackupFastVault';
import { useCreateVaultSetup } from './hooks/useCreateVaultSetup';
import { SetupFastVaultEducationSlides } from './SetupFastVaultEducationSlides';

type KeygenStepProps = OnBackProp & {
  onTryAgain: () => void;
};
export const SetupFastVaultCreationStep = ({ onTryAgain }: KeygenStepProps) => {
  const { vault, ...state } = useCreateVaultSetup();

  const { t } = useTranslation();
  const title = t('creating_vault');

  return (
    <MatchQuery
      value={state}
      success={() => <BackupFastVault vault={shouldBePresent(vault)} />}
      error={error => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <KeygenFailedState message={error.message} onTryAgain={onTryAgain} />
        </>
      )}
      pending={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <SetupFastVaultEducationSlides />
        </>
      )}
    />
  );
};
