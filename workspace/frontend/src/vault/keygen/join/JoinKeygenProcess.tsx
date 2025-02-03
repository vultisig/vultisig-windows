import { useEffect } from 'react';

import { TitleProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { KeygenFailedState } from '../shared/KeygenFailedState';
import { KeygenPageHeader } from '../shared/KeygenPageHeader';
import { KeygenPendingState } from '../shared/KeygenPendingState';
import { KeygenSuccessStep } from '../shared/KeygenSuccessStep';
import { useKeygenMutation } from '../shared/mutations/useKeygenMutation';

export const JoinKeygenProcess = ({ title }: TitleProp) => {
  const { mutate: joinKeygen, ...joinKeygenState } = useKeygenMutation();

  useEffect(joinKeygen, [joinKeygen]);

  const navigate = useAppNavigate();

  return (
    <MatchQuery
      value={joinKeygenState}
      success={vault => <KeygenSuccessStep value={vault} title={title} />}
      error={error => (
        <>
          <KeygenPageHeader title={title} />
          <KeygenFailedState
            message={error.message}
            onTryAgain={() => {
              navigate('vault');
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
