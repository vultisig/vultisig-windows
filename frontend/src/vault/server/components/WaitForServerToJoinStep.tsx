import { useEffect } from 'react';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { recordFromKeys } from '../../../lib/utils/record/recordFromKeys';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { usePeersSelectionRecord } from '../../keysign/shared/state/selectedPeers';
import { WaitForServerStates } from './WaitForServerLoader';

export const WaitForServerToJoinStep: React.FC<
  ComponentWithForwardActionProps &
    Partial<ComponentWithBackActionProps> &
    TitledComponentProps
> = ({ onForward, title }) => {
  const peerOptionsQuery = usePeerOptionsQuery();

  const [, setRecord] = usePeersSelectionRecord();

  const { data } = peerOptionsQuery;
  useEffect(() => {
    if (data && !isEmpty(data)) {
      setRecord(recordFromKeys(data, () => true));
      setTimeout(() => onForward(), 2000);
    }
  }, [data, onForward, setRecord]);

  return (
    <>
      <MatchQuery
        value={peerOptionsQuery}
        pending={() => <WaitForServerStates state="pending" />}
        success={() => <WaitForServerStates state="success" />}
        error={error => (
          <FullPageFlowErrorState
            message={extractErrorMsg(error)}
            title={title}
          />
        )}
      />
    </>
  );
};
