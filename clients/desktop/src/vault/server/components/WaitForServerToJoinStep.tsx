import { isEmpty } from '@lib/utils/array/isEmpty';
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg';
import { recordFromKeys } from '@lib/utils/record/recordFromKeys';
import { useEffect } from 'react';

import { OnBackProp, OnForwardProp, TitleProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { usePeersSelectionRecord } from '../../keysign/shared/state/selectedPeers';
import { WaitForServerStates } from './WaitForServerStates';

export const WaitForServerToJoinStep: React.FC<
  OnForwardProp & Partial<OnBackProp> & TitleProp
> = ({ onForward, title }) => {
  const peerOptionsQuery = usePeerOptionsQuery();
  const [, setRecord] = usePeersSelectionRecord();
  const { data } = peerOptionsQuery;

  useEffect(() => {
    if (data && !isEmpty(data)) {
      setRecord(recordFromKeys(data, () => true));
    }
  }, [data, setRecord]);

  return (
    <>
      <MatchQuery
        value={peerOptionsQuery}
        pending={() => <WaitForServerStates state="pending" />}
        success={() => (
          <WaitForServerStates state="success" onForward={onForward} />
        )}
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
