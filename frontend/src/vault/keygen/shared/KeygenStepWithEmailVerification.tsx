import { useEffect, useState } from 'react';

import { storage } from '../../../../wailsjs/go/models';
import { Transition } from '../../../lib/ui/base/Transition';
import {
  ComponentWithBackActionProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenEmailCodeConfirmation } from './KeygenEmailCodeConfirmation';
import { KeygenFailedState } from './KeygenFailedState';
import { KeygenPendingState } from './KeygenPendingState';
import { KeygenSuccessState } from './KeygenSuccessState';
import { useKeygenMutation } from './mutations/useKeygenMutation';

type KeygenStepProps = ComponentWithBackActionProps &
  TitledComponentProps & {
    onTryAgain: () => void;
  };

export const KeygenStepWithEmailVerification = ({
  onTryAgain,
  title,
}: KeygenStepProps) => {
  const [newVault, setNewVault] = useState<storage.Vault | null>(null);
  const { mutateAsync: createVault, ...mutationState } = useKeygenMutation();

  useEffect(() => {
    (async () => {
      setNewVault(await createVault());
    })();
  }, [createVault]);

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
          to={<KeygenEmailCodeConfirmation vault={newVault} />}
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
          <KeygenPendingState />
        </>
      )}
    />
  );
};
