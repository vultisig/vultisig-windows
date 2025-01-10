import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo';
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo';
import { useKeysignPayload } from '../../shared/state/keysignPayload';

export const KeysignTxOverview = () => {
  const { swapPayload } = useKeysignPayload();

  if (swapPayload) {
    return <KeysignSwapTxInfo />;
  }

  return <KeysignTxPrimaryInfo />;
};
