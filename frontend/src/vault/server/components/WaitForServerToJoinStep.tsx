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
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { usePeersSelectionRecord } from '../../keysign/shared/state/selectedPeers';
import { WaitForServerLoader } from './WaitForServerLoader';

export const WaitForServerToJoinStep: React.FC<
  ComponentWithForwardActionProps &
    Partial<ComponentWithBackActionProps> &
    TitledComponentProps
> = ({ onForward, onBack, title }) => {
  const peerOptionsQuery = usePeerOptionsQuery();

  const [, setRecord] = usePeersSelectionRecord();

  const { data } = peerOptionsQuery;
  useEffect(() => {
    if (data && !isEmpty(data)) {
      setRecord(recordFromKeys(data, () => true));
      onForward();
    }
  }, [data, onForward, setRecord]);

  const header = (
    <PageHeader
      title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      primaryControls={<PageHeaderBackButton onClick={onBack} />}
    />
  );

  return (
    <>
      <MatchQuery
        value={peerOptionsQuery}
        pending={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        success={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
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
