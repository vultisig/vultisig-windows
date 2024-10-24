import { useEffect } from 'react';

import { Transition } from '../../../lib/ui/base/Transition';
import {
  ComponentWithBackActionProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenBackup } from './KeygenBackup';
import { KeygenFailedState } from './KeygenFailedState';
import { KeygenPendingState } from './KeygenPendingState';
import { KeygenSuccessState } from './KeygenSuccessState';
import { useKeygenMutation } from './mutations/useKeygenMutation';

type KeygenStepProps = ComponentWithBackActionProps &
  TitledComponentProps & {
    onTryAgain: () => void;
  };

export const KeygenStep = ({ onBack, onTryAgain, title }: KeygenStepProps) => {
  const { mutate: start, ...mutationState } = useKeygenMutation();

  useEffect(start, [start]);

  return (
    <QueryDependant
      query={mutationState}
      success={() => (
        <Transition
          delay={3000}
          from={
            <>
              <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
              <KeygenSuccessState />
            </>
          }
          to={<KeygenBackup />}
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
          <PageHeader
            title={<PageHeaderTitle>{title}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
          />
          <KeygenPendingState />
        </>
      )}
    />
  );
};
