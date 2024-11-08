import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Transition } from '../../../lib/ui/base/Transition';
import { TitledComponentProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { makeAppPath } from '../../../navigation';
import { KeygenBackup } from '../shared/KeygenBackup';
import { KeygenFailedState } from '../shared/KeygenFailedState';
import { KeygenPageHeader } from '../shared/KeygenPageHeader';
import { KeygenPendingState } from '../shared/KeygenPendingState';
import { KeygenSuccessState } from '../shared/KeygenSuccessState';
import { useKeygenMutation } from '../shared/mutations/useKeygenMutation';

export const JoinKeygenProcess = ({ title }: TitledComponentProps) => {
  const { mutate: joinKeygen, ...joinKeygenState } = useKeygenMutation();

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
              <KeygenPageHeader title={title} />
              <KeygenSuccessState />
            </>
          }
          to={<KeygenBackup />}
        />
      )}
      error={error => (
        <>
          <KeygenPageHeader title={title} />
          <KeygenFailedState
            message={error.message}
            onTryAgain={() => {
              navigate(makeAppPath('vault'));
            }}
          />
        </>
      )}
      pending={() => (
        <>
          <KeygenPageHeader title={title} />
          <KeygenPendingState />
        </>
      )}
    />
  );
};
