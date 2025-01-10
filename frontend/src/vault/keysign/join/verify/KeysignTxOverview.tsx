import { TxOverviewPanel } from '../../../../chain/tx/components/TxOverviewPanel';
import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo';
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo';
import { useKeysignPayload } from '../../shared/state/keysignPayload';

export const KeysignTxOverview = () => {
  const { swapPayload } = useKeysignPayload();

  return (
    <TxOverviewPanel>
      {swapPayload.value ? <KeysignSwapTxInfo /> : <KeysignTxPrimaryInfo />}
    </TxOverviewPanel>
  );
};
