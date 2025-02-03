import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { StepTransition } from '../../../lib/ui/base/StepTransition';
import { OnBackProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { VerifyEmailStep } from '../../fast/components/VerifyEmailStep';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { KeygenSuccessStep } from '../../keygen/shared/KeygenSuccessStep';
import { useKeygenMutation } from '../../keygen/shared/mutations/useKeygenMutation';
import { getStorageVaultId } from '../../utils/storageVault';
import { SetupFastVaultEducationSlides } from './SetupFastVaultEducationSlides';

type KeygenStepProps = OnBackProp & {
  onTryAgain: () => void;
};
export const SetupFastVaultCreationStep = ({ onTryAgain }: KeygenStepProps) => {
  const { mutate: start, ...mutationState } = useKeygenMutation();
  const { t } = useTranslation();

  const title = t('creating_vault');

  useEffect(start, [start]);

  return (
    <MatchQuery
      value={mutationState}
      success={vault => (
        <StepTransition
          from={({ onForward }) => (
            <VerifyEmailStep
              onForward={onForward}
              vaultId={getStorageVaultId(vault)}
            />
          )}
          to={() => <KeygenSuccessStep value={vault} title={title} />}
        />
      )}
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
