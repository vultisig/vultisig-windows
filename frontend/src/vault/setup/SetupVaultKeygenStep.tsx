import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Transition } from '../../lib/ui/base/Transition';
import { ComponentWithBackActionProps } from '../../lib/ui/props';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { KeygenBackup } from '../keygen/shared/KeygenBackup';
import { KeygenFailedState } from '../keygen/shared/KeygenFailedState';
import { KeygenPendingState } from '../keygen/shared/KeygenPendingState';
import { KeygenSuccessState } from '../keygen/shared/KeygenSuccessState';
import { useStartKeygenMutation } from '../keygen/start/mutations/useStartKeygenMutation';

export const SetupVaultKeygenStep = ({
  onBack,
}: ComponentWithBackActionProps) => {
  const { mutate: start, ...mutationState } = useStartKeygenMutation();

  const { t } = useTranslation();

  useEffect(start, [start]);

  return (
    <QueryDependant
      query={mutationState}
      success={() => (
        <Transition
          delay={3000}
          from={
            <>
              <PageHeader
                title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
              />
              <KeygenSuccessState />
            </>
          }
          to={<KeygenBackup />}
        />
      )}
      error={error => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
          />
          <KeygenFailedState message={error.message} onTryAgain={onBack} />
        </>
      )}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
          />
          <KeygenPendingState />
        </>
      )}
    />
  );
};
