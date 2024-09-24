import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Transition } from '../../../lib/ui/base/Transition';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { makeAppPath } from '../../../navigation';
import { KeygenBackup } from '../shared/KeygenBackup';
import { KeygenFailedState } from '../shared/KeygenFailedState';
import { KeygenPageHeader } from '../shared/KeygenPageHeader';
import { KeygenSuccessState } from '../shared/KeygenSuccessState';
import { useJoinKeygenMutation } from './mutations/useJoinKeygenMutation';
import { JoinKeygenPendingState } from './pending/JoinKeygenPendingState';

export const JoinKeygenProcess = () => {
  const { mutate: joinKeygen, ...joinKeygenState } = useJoinKeygenMutation();

  const { t } = useTranslation();

  useEffect(joinKeygen, [joinKeygen]);

  const navigate = useNavigate();

  return (
    <QueryDependant
      query={joinKeygenState}
      success={() => (
        <Transition
          delay={3000}
          from={
            <>
              <KeygenPageHeader title={`${t('join')} ${t('keygen')}`} />
              <KeygenSuccessState />
            </>
          }
          to={<KeygenBackup />}
        />
      )}
      error={error => (
        <>
          <KeygenPageHeader />
          <KeygenFailedState
            message={error.message}
            onTryAgain={() => {
              navigate(makeAppPath('vaultList'));
            }}
          />
        </>
      )}
      pending={() => (
        <>
          <KeygenPageHeader />
          <JoinKeygenPendingState />
        </>
      )}
    />
  );
};
